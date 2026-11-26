"""Build data/official-stats/ir_quarterly.csv from USCIS source spreadsheets.

Inputs (download from uscis.gov/tools/reports-and-studies/immigration-and-citizenship-data):
  - I-130 performance data, one file per quarter, named p_fyYYqN.xlsx
    ("Number of Form I-130 ... by Category, Case Status, and USCIS Field Office or Service Center")
  - Quarterly all-forms reports, one per quarter, named q_fyYYqN.xlsx
    (used only for the IR median processing time, FY25 Q1 onward)

Usage:
  python3 scripts/official-stats/extract_uscis.py SOURCE_DIR data/official-stats/ir_quarterly.csv

Office split:
  SCOPS = the five service centers (codes NSC, SSC/TSC, ESC/VSC, YSC/PSC, WSC/CSC).
  FOD   = every other domestic office in the file, including the National Benefits Center (NBC).
  USCIS places the NBC under the Field Operations Directorate, so it counts as FOD here.
"""
import csv
import glob
import os
import re
import sys

import openpyxl

SCOPS = {'NSC', 'SSC', 'TSC', 'ESC', 'VSC', 'YSC', 'PSC', 'WSC', 'CSC'}
QUARTER_END = {'Q1': 'Dec', 'Q2': 'Mar', 'Q3': 'Jun', 'Q4': 'Sep'}


def rows(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    for r in wb.worksheets[0].iter_rows(values_only=True):
        yield [c for c in r if c is not None and str(c).strip() != '']


def as_num(x):
    return x if isinstance(x, (int, float)) else 0


def performance(path):
    """Return IR totals and the SCOPS / FOD split for one quarter."""
    total = None
    split = {'scops': [0, 0], 'fod': [0, 0]}  # [received, pending]
    for c in rows(path):
        if len(c) < 10:
            continue
        if str(c[0]).lower().startswith('grand total'):
            nums = [x for x in c if isinstance(x, (int, float))]
            total = dict(ir_received=nums[0], ir_approved=nums[1], ir_denied=nums[2], ir_pending=nums[3])
            continue
        code = str(c[1]).strip()
        if not re.fullmatch(r'[A-Z]{3}', code):
            continue
        n = [as_num(x) for x in c[2:10]]
        side = 'scops' if code in SCOPS else 'fod'
        split[side][0] += n[0]
        split[side][1] += n[3]
    return total, split


def ir_median(path):
    for c in rows(path):
        if c and str(c[0]).startswith('I-130') and len(c) > 7 and 'Immediate' in str(c[1]):
            return c[7]
    return ''


def main(src, out):
    result = []
    for p in sorted(glob.glob(os.path.join(src, 'p_fy*.xlsx')), key=lambda f: re.search(r'fy(\d\d)q(\d)', f).groups()):
        fy, q = re.search(r'fy(\d\d)q(\d)', p).groups()
        quarter = f'FY{fy}Q{q}'
        total, split = performance(p)
        year = 2000 + int(fy) - (1 if q == '1' else 0)
        qfile = os.path.join(src, f'q_fy{fy}q{q}.xlsx')
        result.append(dict(
            quarter=quarter, label=f'FY{fy} Q{q}', quarter_end=f"{QUARTER_END['Q' + q]} {year}",
            **total,
            ir_median_months=ir_median(qfile) if os.path.exists(qfile) else '',
            scops_received=int(split['scops'][0]), fod_received=int(split['fod'][0]),
            scops_pending=int(split['scops'][1]), fod_pending=int(split['fod'][1]),
        ))
        gap = total['ir_pending'] - split['scops'][1] - split['fod'][1]
        if abs(gap) > 1:
            print(f'warning: {quarter} office split differs from grand total by {gap}', file=sys.stderr)
    with open(out, 'w', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=list(result[0]))
        w.writeheader()
        w.writerows(result)
    print(f'{len(result)} quarters written to {out}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
