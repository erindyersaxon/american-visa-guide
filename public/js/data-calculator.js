/*
   American Visa Guide: timeline calculator on the /data wait times page.
   Moved unchanged from an inline script in data.html (26 Nov 2026). Its
   functions stay global because the Calculate button calls
   calculateInterviewToPassport() from an onclick attribute.
 */
let calcCachedData = null;

async function fetchTimelineData() {
  if (calcCachedData) return calcCachedData;
  try {
    const response = await fetch('/api/data');
    // An error body ({error, missing}) is truthy, so returning it here
    // slipped past the `if (!data)` guard at the call sites and reached
    // the projection maths as garbage. Treat any non-2xx as no data.
    if (!response.ok) throw new Error('http ' + response.status);
    const data = await response.json();
    calcCachedData = data;
    return data;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return null;
  }
}

function calcAddDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/* MBE is closed on weekends and UK bank holidays (pickup counts working
   days), and Royal Mail doesn't deliver on Sundays or bank holidays
   (mail counts delivery days). England & Wales bank holidays through 2028. */
const calcUkBankHolidays = new Set([
  '2025-01-01', '2025-04-18', '2025-04-21', '2025-05-05', '2025-05-26', '2025-08-25', '2025-12-25', '2025-12-26',
  '2026-01-01', '2026-04-03', '2026-04-06', '2026-05-04', '2026-05-25', '2026-08-31', '2026-12-25', '2026-12-28',
  '2027-01-01', '2027-03-26', '2027-03-29', '2027-05-03', '2027-05-31', '2027-08-30', '2027-12-27', '2027-12-28',
  '2028-01-03', '2028-04-14', '2028-04-17', '2028-05-01', '2028-05-29', '2028-08-28', '2028-12-25', '2028-12-26'
]);

function calcToISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calcIsBankHoliday(date) {
  return calcUkBankHolidays.has(calcToISO(date));
}

/* The embassy also closes for US federal holidays (observed dates,
   2025–2028), no interviews on these, on UK bank holidays, or weekends. */
const calcUsFederalHolidays = new Set([
  '2025-01-01', '2025-01-20', '2025-02-17', '2025-05-26', '2025-06-19', '2025-07-04', '2025-09-01', '2025-10-13', '2025-11-11', '2025-11-27', '2025-12-25',
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-05-25', '2026-06-19', '2026-07-03', '2026-09-07', '2026-10-12', '2026-11-11', '2026-11-26', '2026-12-25',
  '2027-01-01', '2027-01-18', '2027-02-15', '2027-05-31', '2027-06-18', '2027-07-05', '2027-09-06', '2027-10-11', '2027-11-11', '2027-11-25', '2027-12-24', '2027-12-31',
  '2028-01-17', '2028-02-21', '2028-05-29', '2028-06-19', '2028-07-04', '2028-09-04', '2028-10-09', '2028-11-10', '2028-11-23', '2028-12-25'
]);

function calcIsEmbassyClosed(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return true;
  const iso = calcToISO(date);
  return calcUkBankHolidays.has(iso) || calcUsFederalHolidays.has(iso);
}

function calcNextEmbassyDay(date) {
  const d = new Date(date);
  while (calcIsEmbassyClosed(d)) d.setDate(d.getDate() + 1);
  return d;
}

function calcIsMbeClosed(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return true;
  return calcIsBankHoliday(date);
}

function calcIsMailNonDeliveryDay(date) {
  if (date.getDay() === 0) return true;
  return calcIsBankHoliday(date);
}

function calcAddCountedDays(date, days, isSkipped) {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (!isSkipped(result)) remaining--;
  }
  return result;
}

function calcAddWorkingDays(date, days) {
  return calcAddCountedDays(date, days, calcIsMbeClosed);
}

function calcAddMailDays(date, days) {
  return calcAddCountedDays(date, days, calcIsMailNonDeliveryDay);
}

function calcFormatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

/* ISO date-string helpers: all arithmetic in local time at noon so
   formatting never shifts a day across timezones. */
function calcParseISO(iso) {
  return new Date(iso + 'T12:00:00');
}

function calcFmtISO(iso) {
  return calcFormatDate(calcParseISO(iso));
}

function calcDaysBetweenISO(a, b) {
  return Math.round((calcParseISO(b) - calcParseISO(a)) / 86400000);
}

function calcAddDaysISO(iso, days) {
  const d = calcParseISO(iso);
  d.setDate(d.getDate() + days);
  return calcToISO(d);
}

function calcNextEmbassyDayISO(iso) {
  return calcToISO(calcNextEmbassyDay(calcParseISO(iso)));
}

async function calculateInterviewToPassport() {
  const interviewInput = document.getElementById('interview-date').value;
  const method = document.getElementById('delivery-method').value;

  if (!interviewInput || !method) {
    alert('Please select both interview date and delivery method');
    return;
  }

  const data = await fetchTimelineData();
  if (!data || !data.calculator) {
    alert('Unable to load timeline data');
    return;
  }

  const interviewDate = new Date(interviewInput);
  let stats;

  if (method === 'Pickup') {
    stats = data.calculator.passport_pickup_stats;
  } else if (method === 'Mail') {
    stats = data.calculator.passport_mail_stats;
  }

  if (!stats) {
    alert('No data available for this delivery method');
    return;
  }

  const addDays = method === 'Pickup' ? calcAddWorkingDays : calcAddMailDays;
  const expectedDate = addDays(interviewDate, stats.median);
  const minDate = addDays(interviewDate, stats.min);
  const maxDate = addDays(interviewDate, stats.max);
  const methodLabel = method === 'Pickup' ? 'MBE pickup' : 'home delivery';
  const dayLabel = method === 'Pickup' ? 'working days' : 'delivery days';

  document.getElementById('passport-date').textContent = calcFormatDate(expectedDate);
  document.getElementById('passport-range').textContent = `Range: ${calcFormatDate(minDate)} – ${calcFormatDate(maxDate)}`;
  document.getElementById('passport-confidence').textContent = `Based on ${stats.n} ${methodLabel} cases (median ${stats.median} ${dayLabel})`;
  document.getElementById('passport-result').style.display = 'block';
}
