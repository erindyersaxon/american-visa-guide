"""Parse State Department monthly 'IV Issuances by Post and Visa Class' reports into CSV.

Source PDFs: travel.state.gov > Visa Statistics > Monthly Immigrant Visa Issuance Statistics.
Convert each PDF to text first, keeping the month name and year in the file name:
  pdftotext -layout "FEBRUARY 2026 - IV Issuances by Post and Visa Class.pdf" FEBRUARY_2026.txt

Usage:
  python3 scripts/official-stats/extract_dos.py TEXT_DIR out.csv

Output columns: month (YYYY-MM), post, visa_class, issued. Filter post == 'London' for the Guide.
Monthly figures are preliminary: FY2024 London monthly totals summed to 4,390 against 4,369 in the
final Report of the Visa Office (Table XIV).
"""
import csv, glob, os, re, sys

SRC, OUT = sys.argv[1], sys.argv[2]
MONTHS = {m: i for i, m in enumerate(['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY',
                                       'AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'], 1)}
line_re = re.compile(r'^\s*(\S.*?\S)\s{2,}([A-Z0-9]{1,4})\s+([\d,]+)\s*$')
rows = []
for f in sorted(glob.glob(os.path.join(SRC, '*.txt'))):
    b = os.path.basename(f)
    mon, yr = re.match(r'([A-Z]+)_-?_?(\d{4})', b).groups()
    ym = f'{yr}-{MONTHS[mon]:02d}'
    for line in open(f, encoding='utf-8', errors='replace'):
        m = line_re.match(line)
        if not m: continue
        post, cls, n = m.groups()
        if post.lower().startswith(('post', 'grand', 'total', 'page')): continue
        rows.append(dict(month=ym, post=post.strip(), visa_class=cls, issued=int(n.replace(',', ''))))
with open(OUT, 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=['month', 'post', 'visa_class', 'issued']); w.writeheader(); w.writerows(rows)
print(len(rows), 'rows from', len(glob.glob(os.path.join(SRC, '*.txt'))), 'files')
