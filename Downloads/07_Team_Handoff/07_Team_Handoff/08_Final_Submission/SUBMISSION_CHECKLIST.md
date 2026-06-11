# 5011CEM Submission Checklist

## What is in this folder
| File | What it is | Submit where |
| --- | --- | --- |
| BryanTeyKaiYuan_5011CEM_CW1_Report.docx / .pdf | Bryan's individual progressive report (4,328 words, 14 refs) | Canvas "Individual Progressive Report Submission" + Turnitin, due 21 Jun 2026 |
| ThongWaiKit_5011CEM_CW1_Report.docx / .pdf | Thong's individual progressive report (4,414 words, 14 refs) | Same, from Thong's account, due 21 Jun 2026 |
| BryanTey_ThongWaiKit_5011CEM_Group_Final_Report.docx / .pdf | Group final report (4,426 words, 15 refs, 24 figures, 5 tables) | Canvas "Final Report Submission (Group)", due 28 Jun 2026 |
| 5011CEM_Viva_Presentation.pptx | 18-slide viva deck | Viva weeks 13-14 |
| VIVA_TALKING_POINTS.md | Per-slide speaking notes (Bryan/Thong split) + 12-question Q&A bank | Rehearsal material, not submitted |
| build_*.py | Generators; re-run with `python -X utf8 build_x.py` to regenerate any document | Not submitted |

## Before submitting — manual steps that only you can do
1. READ EVERY REPORT FULLY. You must be able to defend every sentence at viva. Personalise anything that does not sound like you.
2. Run each PDF through Turnitin early; the spec requires similarity <= 20%. Cross-similarity between the two individual reports measured at ~6% (boilerplate + references only), but verify with the real checker.
3. Insert the Turnitin receipt screenshot into the "Turnitin Similarity Percentage Page" (last page of each individual report), then re-export the PDF.
4. Sign the cover-sheet Declaration (typed name is present; add signatures if your lecturer expects handwritten/digital ones).
5. Submit PDFs (the spec requires PDF format), with the exact filename format Yourname_5011CEM_CW1_Report.
6. GitHub repo: consider renaming gokuthong/5011cem-paysim-fraud-detection to something like 5011cem-home-credit-default (GitHub redirects the old URL automatically). The viva deck currently shows the shortened name "gokuthong/5011cem". Make the repo public when the lecturer requests.
7. ToC fields: already populated in the PDFs. If you edit a .docx, press Ctrl+A then F9 in Word to refresh the ToC before re-exporting.
8. Viva: rehearse with VIVA_TALKING_POINTS.md; have the dashboard running locally (`streamlit run dashboard/app.py` from 05_GitHub_and_Code/code with the .venv) for the live demo slide.

## Verified state of the codebase (2026-06-11)
- 20/20 pytest tests pass (code/.venv, Python 3.12, pinned requirements).
- Full pipeline rerun on the real 307,511-row dataset; all report numbers reproduced, metrics.csv regenerated.
- Dashboard visually tested end-to-end in Chrome (3 pages, low-risk and high-risk prediction paths).
- All 5 system diagrams redrawn for Home Credit (old ones were PaySim leftovers).
- Gantt xlsx Today marker corrected; gantt_homecredit.png rendered for appendices.
- New: src/optimisation.py + optimise_models.py (threshold tuning, calibration, complexity timings, feature importance) + 6 new unit tests.
