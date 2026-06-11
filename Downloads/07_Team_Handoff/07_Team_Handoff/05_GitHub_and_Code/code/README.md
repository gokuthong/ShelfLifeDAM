# 5011CEM Big Data Programming Project: Home Credit Loan-Default Prediction

A big data analytics project that predicts which loan applicants will have
payment difficulties (default) using the **Home Credit Default Risk** dataset,
comparing Logistic Regression, Random Forest and XGBoost, with an interactive
Streamlit dashboard for visualisation and live prediction.

This work is submitted as the coursework for **5011CEM Big Data Programming
Project**, INTI International College Penang in collaboration with Coventry
University.

## Team

| Member             | GitHub     | Role                                                             |
| ------------------ | ---------- | ---------------------------------------------------------------- |
| Bryan Tey Kai Yuan | @gokuthong | EDA, Logistic Regression, Random Forest, Dashboard, Group Report |
| Thong Wai Kit      | @WaiK3412  | Preprocessing, XGBoost, Evaluation, Group Report                 |

## Problem

Lenders must decide which applicants are likely to repay. The challenge is
twofold: defaults are relatively rare (~8% of applicants) which makes them easy
to miss, and rejecting good applicants loses business. This project trains and
compares three machine learning models on **307,511 real loan applications** to
balance recall (catching applicants who will default) against precision
(avoiding wrongly rejecting reliable customers).

## Dataset

[Home Credit Default Risk](https://www.kaggle.com/competitions/home-credit-default-risk/data)
(Home Credit Group, 2018). Real, anonymised consumer-loan data. The core table
used here is `application_train.csv` — **307,511 rows × 122 columns**:

- **Target:** `TARGET` — 1 = client had payment difficulties (default), 0 = repaid (~8.1% default rate).
- **Features:** income, credit/annuity amounts, demographics, employment, three
  external credit scores (`EXT_SOURCE_1/2/3`), and a sparse building/property block.
- **Known quirk:** `DAYS_EMPLOYED` uses the sentinel `365243` for pensioners/unemployed,
  replaced with NaN on load.

The dataset also ships relational tables (`bureau`, `previous_application`,
`installments_payments`, `POS_CASH_balance`, `credit_card_balance`,
`bureau_balance`) joinable on `SK_ID_CURR` / `SK_ID_BUREAU` — used for the
optional multi-table extension (see *Future Work*).

The CSVs are large (~3 GB total) and are **not** committed to this repo (see
`.gitignore`). Download from Kaggle and place `application_train.csv` in `data/`
before running the pipeline.

## Tech Stack

- **Language**: Python 3.12
- **IDE**: Jupyter Notebook (EDA) and VS Code (modules)
- **Libraries**: pandas, numpy, scikit-learn, xgboost, imbalanced-learn,
  matplotlib, seaborn, joblib
- **Dashboard**: Streamlit
- **Version control**: Git and GitHub

## Repository Layout

```
.
README.md                     Project overview
requirements.txt              Dependencies
data/                         Datasets + parquet cache (gitignored)
notebooks/
  01_eda.ipynb                Exploratory data analysis
  02_preprocessing.ipynb      Cleaning, imputation and feature engineering
  03_modelling.ipynb          Statistical tests, K-fold CV and evaluation
src/
  data_loader.py              Load and cache application_train.csv; fix DAYS_EMPLOYED sentinel
  preprocessing.py            Reduction, feature engineering, imputation, encoding, scaling
  eda.py                      Plot and statistics helpers used by the notebook
  evaluation.py               Metrics, ROC curves, confusion matrix, K-fold
  utils.py                    Logging and timing helpers
  models/
    logistic_regression.py    class_weight='balanced'
    random_forest.py          class_weight='balanced_subsample'
    xgboost_model.py          scale_pos_weight (single imbalance correction)
  optimisation.py             Threshold tuning, calibration, complexity timings, feature importance
dashboard/
  app.py                      Streamlit dashboard
reports/                      Generated figures, metrics.csv, threshold_metrics.csv, complexity_timings.csv
outputs/                      Notebook charts and tables
tests/                        pytest unit tests
docs/                         Architecture notes and diagrams
xgb_experiment.py             XGBoost imbalance-strategy comparison (evidence for the model choice)
optimise_models.py            Post-training optimisation pass over the saved models
```

## How To Run

```bash
# 1. Create environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 2. Place the dataset under data/
#    Download application_train.csv from:
#    https://www.kaggle.com/competitions/home-credit-default-risk/data

# 3. Run the full pipeline: EDA figures + train all 3 models + write metrics.csv
python run_pipeline.py
#    (or run modules individually:
#     python -m src.eda
#     python -m src.models.logistic_regression
#     python -m src.models.random_forest
#     python -m src.models.xgboost_model)

# 4. Launch dashboard
streamlit run dashboard/app.py
```

## Results Snapshot

Real numbers from `python run_pipeline.py` (written to `reports/metrics.csv`; test set is
a stratified 20% hold-out):

| Model               | Accuracy | Precision | Recall | F1    | ROC-AUC |
| ------------------- | -------- | --------- | ------ | ----- | ------- |
| XGBoost             | 0.756    | 0.188     | 0.608  | 0.287 | 0.763   |
| Random Forest       | 0.859    | 0.239     | 0.340  | 0.281 | 0.741   |
| Logistic Regression | 0.691    | 0.162     | 0.680  | 0.262 | 0.749   |

**XGBoost gives the best F1 (0.29) and ROC-AUC (0.76) with strong recall (0.61)** — it
catches the most defaulters at a usable precision, so it powers the dashboard's live
prediction. Random Forest is the most accurate but misses more defaulters (recall 0.34);
Logistic Regression is a competitive, fully interpretable baseline. At ~8% defaults,
accuracy is misleading — the precision/recall trade-off and ROC-AUC are the real story.
These are **realistic credit-risk results** (AUC ≈ 0.74–0.76), driven mainly by the three
external credit scores and the engineered credit ratios. ROC curves and confusion matrices
are in `reports/figures/`.

## Future Work

The relational tables (`bureau`, `previous_application`, …) can be aggregated per
`SK_ID_CURR` and joined to the application table to add credit-history features — a
"data integration" step that typically lifts ROC-AUC by a few points.

## License

Coursework submission. Not for redistribution.
