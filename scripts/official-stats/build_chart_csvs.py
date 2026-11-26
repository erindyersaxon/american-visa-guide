"""Build Datawrapper-ready CSVs for the official-data charts from data/official-stats/.

Usage:
  python3 scripts/official-stats/build_chart_csvs.py

Writes data/official-stats/charts/chart{1..4}_*.csv. Chart 5 (the journey) needs tracker
medians from Supabase and is specified in docs/superpowers/specs/2026-11-25-official-data-dataviz-design.md.
Column headers are the labels readers see in Datawrapper, so keep them plain English.
"""
import csv
import os
import statistics

BASE = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'official-stats')
OUT = os.path.join(BASE, 'charts')


def read(name):
    with open(os.path.join(BASE, name), newline='') as fh:
        return list(csv.DictReader(fh))


def write(name, header, rows):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name), 'w', newline='') as fh:
        w = csv.writer(fh)
        w.writerow(header)
        w.writerows(rows)
    print('wrote', name, len(rows), 'rows')


def main():
    # Chart 1: four USCIS processing-time measures on one months axis (dot plot / range plot).
    times = read('time_measures.csv')
    write('chart1_processing_time_measures.csv',
          ['Measure', 'Months', 'Period', 'Source'],
          [[t['measure'], t['months'], t['period'], t['source']] for t in times])

    q = read('ir_quarterly.csv')

    # Chart 2: where IR I-130s wait (stacked columns, pending at quarter end).
    write('chart2_queue_by_directorate.csv',
          ['Quarter ending', 'Service centers', 'Field offices and National Benefits Center'],
          [[r['quarter_end'], r['scops_pending'], r['fod_pending']] for r in q])

    # Chart 3: petitions in vs decisions out (line chart, per quarter).
    write('chart3_received_vs_decided.csv',
          ['Quarter ending', 'Received', 'Decided (approved + denied)'],
          [[r['quarter_end'], r['ir_received'], int(r['ir_approved']) + int(r['ir_denied'])] for r in q])

    # Chart 4: London IR1 + CR1 visas per month, with the typical range for a shaded band.
    lon = read('london_issuances.csv')
    vals = sorted(int(r['spouse_total']) for r in lon)
    q1, med, q3 = statistics.quantiles(vals, n=4, method='inclusive')
    rows = []
    for r in lon:
        y, m = r['month'].split('-')
        label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][int(m) - 1] + ' ' + y
        rows.append([label, r['spouse_total'], round(q1), round(q3)])
    write('chart4_london_spouse_visas.csv',
          ['Month', 'Spouse visas issued (IR1 + CR1)', 'Typical range low', 'Typical range high'], rows)
    print(f'London monthly median {med:.0f}, middle half {q1:.0f} to {q3:.0f}, n={len(vals)} months')


if __name__ == '__main__':
    main()
