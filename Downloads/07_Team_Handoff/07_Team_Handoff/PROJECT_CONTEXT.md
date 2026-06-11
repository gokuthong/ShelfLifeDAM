# 5011CEM Project Context And Team Handoff

This is a project-context file for a teammate who needs to evaluate, maintain,
and improve the current 5011CEM Big Data Programming Project. It explains what
is in the project folder, how the current Home Credit implementation works, how
it relates to the coursework reference materials, what results are already
available, and which areas need review.

## Current Project

- Module: 5011CEM Big Data Programming Project.
- Project title: Home Credit Loan-Default Prediction.
- Team: Bryan Tey Kai Yuan and Thong Wai Kit.
- Problem type: binary classification.
- Main prediction target: `TARGET`, where `1` means the applicant had payment
  difficulty/default and `0` means repaid.
- Core dataset: Home Credit Default Risk, mainly `application_train.csv`.
- Current working code folder: `05_GitHub_and_Code/code/`.
- Dashboard: Streamlit app in `05_GitHub_and_Code/code/dashboard/app.py`.

The project predicts loan-default risk from real anonymised credit application
data. The positive class is rare, around 8 percent of rows, so the project
focuses on recall, precision, F1, and ROC-AUC rather than accuracy alone.

## Handoff Folder Purpose

The new handoff folder is meant to give a teammate enough context to:

1. understand the current Home Credit project;
2. compare the implementation against the assignment requirements;
3. review the EDA, preprocessing, modelling, evaluation, and dashboard;
4. improve weak or incomplete parts before final submission;
5. use the course/reference materials without searching the original workspace.

The handoff folder should be treated as a clean review package, not as the full
raw-data workspace. The raw Kaggle CSV files are not copied because they are
large and can be downloaded again from Kaggle if a full pipeline rerun is needed.

## How The Project Relates To The Reference Materials

The reference materials in `02_Reference_Materials/` are included for review and
improvement work:

- `Assignment_Spec/` should be checked first to confirm every required
  deliverable and marking criterion is covered.
- `Lecture_Slides/5011CEM_Week 2 Project Design and Planning (part 1).pptx`
  supports the project planning, aim, objectives, and scope.
- `Lecture_Slides/5011CEM_Week 3 Project Design and Planning (part 2).pptx`
  supports the project breakdown, tasks, Gantt planning, and methodology.
- `Lecture_Slides/5011CEM_Week 4 Phases in Big Data Project.pptx` supports the
  data lifecycle: data source, collection, cleaning, preparation, analysis, and
  evaluation.
- `Lecture_Slides/Lecture 5 - MongoDB Non-Relational for Beginners.pdf` is
  useful if the report discusses non-relational storage or optional data
  integration.
- `Lecture_Slides/5011CEM_Week 6 Data Mining to Regression.pptx` supports model
  training concepts, evaluation, and regression/classification framing.
- `Lecture_Slides/5011CEM_Week 7 Classification.pptx` supports the binary
  classification section and model comparison.
- `Lab_Materials/Lab 3 - Statistics in Python.pptx` supports the statistical
  tests and correlation analysis used in the EDA.
- `Lab_Materials/Lab 4 - EDA.pptx` supports the exploratory analysis notebook
  and generated EDA plots.
- `Lab_Materials/Lab 4 - MongoDB With Python.pdf` is useful for optional database
  discussion or future integration work.
- `Lab_Materials/Lab 6 - Regression using skLearn.pptx` supports sklearn
  modelling pipeline concepts and train-test evaluation.
- `Lab_Materials/Lab6_dataspliting.ipynb` supports train-test split and data
  splitting decisions.
- `Lab_Materials/Lab 7 - Simple Classification.pptx` supports the classification
  models, confusion matrices, and classification metrics.
- `Sample_Report/annotated-Group_3_Big_Data_Group_Report (1).pdf` is a structure
  reference for report layout and expected academic presentation style.
- `Example_Notebooks/PaySim_Fraud_EDA.ipynb` is only a notebook-format reference.
  The current project itself is Home Credit loan-default prediction.

## Current Folder Map

### Context File

- This project-context file is `SUBMISSION_CONTEXT.md` in the source workspace.
- In the teammate handoff folder it is copied as `PROJECT_CONTEXT.md` so it is
  the first file to read.

### Reference Materials

- `02_Reference_Materials/`: assignment specification, lectures, lab materials,
  sample report, and example notebook.

### Planning

- `03_Gantt_Chart/HomeCredit_Project_Gantt_Chart.xlsx`: current Home Credit
  Gantt chart.

### Diagrams And Report Images

- `04_Diagrams/EDA_Plots/`: report-level EDA images.
- `04_Diagrams/ML_Evaluation_Plots/`: confusion matrices and ROC curves.
- `04_Diagrams/System_Diagrams/`: system diagrams that should be reviewed
  carefully against the current Home Credit project before final use.

### Current Code

- `05_GitHub_and_Code/code/README.md`: main code repository overview.
- `05_GitHub_and_Code/code/run_pipeline.py`: end-to-end pipeline runner.
- `05_GitHub_and_Code/code/xgb_experiment.py`: imbalance-handling experiment
  for XGBoost.
- `05_GitHub_and_Code/code/src/`: reusable Python modules.
- `05_GitHub_and_Code/code/src/models/`: Logistic Regression, Random Forest,
  and XGBoost model scripts.
- `05_GitHub_and_Code/code/dashboard/app.py`: Streamlit dashboard.
- `05_GitHub_and_Code/code/notebooks/`: executed EDA, preprocessing, and
  modelling notebooks.
- `05_GitHub_and_Code/code/reports/`: generated metric table and model figures.
- `05_GitHub_and_Code/code/outputs/`: notebook chart/table outputs.
- `05_GitHub_and_Code/code/tests/`: pytest tests.
- `05_GitHub_and_Code/code/docs/architecture.md`: architecture explanation and
  Mermaid ERD source.

## How The Pipeline Works

### 1. Data Loading

`src/data_loader.py` loads `application_train.csv`, checks that the `TARGET`
column is present, and can cache the raw table as `applications.parquet` for
faster reruns. The cache is a local runtime artefact.

The loader also fixes the Home Credit `DAYS_EMPLOYED == 365243` sentinel by
replacing it with missing values. This is important because the sentinel is not a
real employment duration and would otherwise distort EDA and modelling.

### 2. Preprocessing

`src/preprocessing.py` builds the feature matrix and label vector. It:

- removes exact duplicate rows;
- keeps rows with missing values because missingness is handled inside the
  sklearn pipeline;
- engineers six domain features:
  - `AGE_YEARS`;
  - `YEARS_EMPLOYED`;
  - `CREDIT_INCOME_RATIO`;
  - `ANNUITY_INCOME_RATIO`;
  - `CREDIT_TERM`;
  - `EMPLOYED_AGE_RATIO`;
- removes `SK_ID_CURR` and `TARGET` from model features;
- drops columns with at least 60 percent missing values;
- drops `FLAG_DOCUMENT_*` columns;
- median-imputes and scales numeric features;
- mode-imputes and one-hot encodes categorical features;
- uses `handle_unknown='ignore'` for unseen categories;
- uses stratified train-test splitting to preserve class balance.

The preprocessing is inside sklearn pipelines, which prevents train-test leakage
and lets the dashboard reuse the same fitted transformations.

### 3. EDA

`src/eda.py` creates the EDA charts and statistical summaries used by notebooks
and the report. It covers:

- class balance;
- default rate by categorical groups;
- numeric distributions;
- external source score distributions;
- credit amount versus income;
- missing-value profiling;
- log transform visualisation;
- correlation heatmap;
- point-biserial correlation;
- chi-square tests.

The EDA outputs are available in both `code/reports/figures/` and
`04_Diagrams/EDA_Plots/`.

### 4. Modelling

The project trains and compares:

- Logistic Regression with `class_weight='balanced'`;
- Random Forest with `class_weight='balanced_subsample'`;
- XGBoost with `scale_pos_weight` based on the train-fold imbalance ratio.

`xgb_experiment.py` compares imbalance-handling strategies and supports the
choice to use only `scale_pos_weight` for the final XGBoost model.

### 5. Evaluation

`src/evaluation.py` calculates:

- accuracy;
- precision;
- recall;
- F1;
- ROC-AUC;
- confusion matrices;
- ROC curves;
- classification reports;
- stratified K-fold scores.

The consolidated model result table is:

- `05_GitHub_and_Code/code/reports/metrics.csv`

Current hold-out metrics:

| Model               | Accuracy | Precision | Recall |    F1 | ROC-AUC |
| ------------------- | -------: | --------: | -----: | ----: | ------: |
| XGBoost             |    0.759 |     0.190 |  0.612 | 0.290 |   0.763 |
| Random Forest       |    0.861 |     0.240 |  0.332 | 0.278 |   0.742 |
| Logistic Regression |    0.691 |     0.162 |  0.676 | 0.261 |   0.749 |

XGBoost is currently treated as the deployed model because it gives the best F1
and ROC-AUC while keeping recall strong for the minority class.

### 6. Dashboard

`dashboard/app.py` has three Streamlit pages:

- Overview: summary KPIs and exploratory charts.
- Model Comparison: metrics table, confusion matrices, and ROC curves.
- Live Prediction: applicant input form using the XGBoost model pipeline.

The dashboard fills unspecified features with typical median or modal values,
recalculates dependent engineered ratios, and reports a relative risk band. The
risk score should be interpreted as a ranking score, not a perfectly calibrated
default probability.

### 7. Testing

The tests cover:

- duplicate removal;
- missing-row retention;
- engineered feature creation;
- feature-column selection;
- imputation;
- stratified split balance;
- K-fold output shape;
- Streamlit dashboard boot and page routing.

Run tests from `05_GitHub_and_Code/code/`:

```bash
python -m pytest -q
```

## How To Run Locally

From `05_GitHub_and_Code/code/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run_pipeline.py
streamlit run dashboard/app.py
python -m pytest -q
```

For a full rerun, download the Home Credit Default Risk dataset from Kaggle and
place `application_train.csv` in `05_GitHub_and_Code/code/data/`. The data
dictionary file `HomeCredit_columns_description.csv` is useful for understanding
the feature meanings.

## Claude prompt

You are reviewing a 5011CEM Big Data Programming Project handoff folder for a
Home Credit loan-default prediction coursework project.

Your job is to independently evaluate the project and decide what, if anything,
needs to be improved before final submission. Do not assume the project context
is fully correct. Inspect the files, compare the implementation against the
assignment/reference materials, and ground every finding in specific evidence
from the folder.

Start by reading:

- PROJECT_CONTEXT.md
- 02_Reference_Materials/Assignment_Spec/
- 05_GitHub_and_Code/code/README.md
- 05_GitHub_and_Code/code/docs/architecture.md
- 05_GitHub_and_Code/code/reports/metrics.csv
- 05_GitHub_and_Code/code/notebooks/
- 05_GitHub_and_Code/code/src/
- 05_GitHub_and_Code/code/dashboard/app.py
- 05_GitHub_and_Code/code/tests/
- 03_Gantt_Chart/
- 04_Diagrams/

Then produce a review with these sections:

1. Project understanding
   Summarise what the project currently does, what dataset/problem it addresses,
   what models it uses, and what deliverables are present.

2. Assignment alignment
   Compare the folder against the assignment specification and identify any
   missing, weak, unclear, or unsupported deliverables. Quote or reference the
   relevant assignment requirement where possible.

3. Technical audit
   Review data loading, EDA, preprocessing, feature engineering, modelling,
   evaluation, tests, notebooks, dashboard, diagrams, and documentation. For
   each issue, explain the evidence, why it matters, and the likely impact.

4. Results audit
   Check whether the reported metrics, figures, model claims, and dashboard
   claims are consistent with the files. Flag any unsupported or misleading
   claims.

5. Submission readiness
   Classify the project as ready, nearly ready, or not ready. Explain the
   classification using evidence from the handoff folder.

6. Recommended action plan
   Derive your own action plan from the audit. Prioritise by coursework impact,
   correctness, and time required. Separate must-fix items from optional polish.

7. What not to do
   List changes that should be avoided because they would reduce correctness,
   create inconsistency, overfit to marks without evidence, break the pipeline,
   duplicate irrelevant old work, or introduce claims that are not supported by
   the files.

Rules:

- Do not invent dataset results or model performance.
- Do not assume raw Kaggle data is present unless you can see it in the folder.
- Do not recommend including large raw datasets in the handoff unless the
  assignment explicitly requires them.
- Do not treat old or reference-only material as current implementation.
- Do not rewrite the project around a different dataset unless there is strong
  assignment evidence requiring that.
- Do not make broad recommendations without linking them to a file, metric,
  notebook, diagram, test, or assignment requirement.
- Prefer a concise, evidence-based review over generic advice.

```

## Handoff Folder Contents

The teammate handoff folder should contain:

- this project context file;
- all course/reference materials in `02_Reference_Materials/`;
- the current Home Credit Gantt chart;
- EDA, model-evaluation, and system-diagram images;
- the current code repository from `05_GitHub_and_Code/code/`;
- generated metrics and figures;
- executed notebooks;
- tests;
- architecture documentation;
- saved model artefacts in `code/models_store/` for quick dashboard review;
- the small Home Credit data dictionary if available.

The handoff folder should not be treated as a raw-data archive. Large Kaggle
CSV/parquet data files can be downloaded again when needed. The saved models can
also be regenerated by running `python run_pipeline.py`.
```
