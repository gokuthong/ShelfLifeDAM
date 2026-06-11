"""Generate the Home Credit system diagrams for the 5011CEM report appendices.

Replaces the obsolete PaySim diagrams in 04_Diagrams/System_Diagrams/ with
versions that describe the actual Home Credit loan-default prediction pipeline
(see 05_GitHub_and_Code/code/src/ and docs/architecture.md).

Outputs (PNG, 140 dpi):
    dfd_level0.png            Context diagram of the prediction system
    dfd_level1.png            Level-1 DFD of the five pipeline processes
    erd.png                   Home Credit relational schema (application + children)
    uml_class.png             Module/class diagram of the codebase
    flowchart_preprocessing.png  Preprocessing steps as implemented

Run with the project venv:
    .venv/Scripts/python.exe ../../06_Working_Files/build_diagrams_homecredit.py
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

OUT_DIR = Path(__file__).resolve().parent.parent / "04_Diagrams" / "System_Diagrams"

ENTITY_FC = "#FFE699"   # external entity / table fill
ENTITY_EC = "#8F7000"
PROCESS_FC = "#9DC3E6"  # process fill
PROCESS_EC = "#2E5C8A"
STORE_FC = "#DEEBD3"    # data store fill
STORE_EC = "#538135"
ARROW_C = "#1F3864"
HEADER_FC = "#FFF2CC"


def _box(ax, x, y, w, h, text, fc, ec, fontsize=11, bold=False, rounded=True):
    style = f"round,pad=0.02,rounding_size={0.12 if rounded else 0.0}"
    patch = FancyBboxPatch(
        (x, y), w, h, boxstyle=style, linewidth=1.6, facecolor=fc, edgecolor=ec
    )
    ax.add_patch(patch)
    ax.text(
        x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fontsize,
        fontweight="bold" if bold else "normal", linespacing=1.4,
    )
    return patch


def _arrow(ax, xy_from, xy_to, label="", offset=(0, 0.12), fontsize=9, style="-|>",
           connection="arc3,rad=0.0", italic=True):
    arr = FancyArrowPatch(
        xy_from, xy_to, arrowstyle=style, mutation_scale=16, linewidth=1.5,
        color=ARROW_C, connectionstyle=connection, zorder=1,
    )
    ax.add_patch(arr)
    if label:
        mx = (xy_from[0] + xy_to[0]) / 2 + offset[0]
        my = (xy_from[1] + xy_to[1]) / 2 + offset[1]
        ax.text(mx, my, label, ha="center", va="center", fontsize=fontsize,
                color="#404040", style="italic" if italic else "normal",
                bbox=dict(facecolor="white", edgecolor="none", pad=1.0))


def _canvas(w, h, title, xmax=10, ymax=10):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(0, xmax)
    ax.set_ylim(0, ymax)
    ax.axis("off")
    ax.set_title(title, fontsize=15, fontweight="bold", pad=14)
    return fig, ax


def _save(fig, name):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    fig.savefig(path, dpi=140, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"wrote {path}")


# ----------------------------------------------------------------------------- DFD L0
def dfd_level0():
    fig, ax = _canvas(11, 6.5, "Data Flow Diagram (Level 0) — Home Credit Loan-Default Prediction System")

    _box(ax, 0.3, 6.8, 2.2, 1.4, "Loan\nApplicant", ENTITY_FC, ENTITY_EC, bold=True)
    _box(ax, 0.3, 1.6, 2.2, 1.4, "Credit\nAnalyst", ENTITY_FC, ENTITY_EC, bold=True)
    _box(ax, 3.9, 3.9, 3.0, 2.1, "1.0\nLoan-Default\nPrediction System", PROCESS_FC, PROCESS_EC, fontsize=12, bold=True)
    _box(ax, 7.5, 7.0, 2.3, 1.6, "Home Credit\nApplication\nDataset (Kaggle)", ENTITY_FC, ENTITY_EC, fontsize=10, bold=True)
    _box(ax, 7.5, 1.6, 2.3, 1.2, "D1  Model Store &\nMetrics Reports", STORE_FC, STORE_EC, fontsize=10)

    _arrow(ax, (2.5, 7.3), (4.4, 6.0), "Applicant details", offset=(-0.5, 0.3))
    _arrow(ax, (4.4, 4.2), (2.5, 2.9), "Risk score & risk band", offset=(0.35, -0.35))
    _arrow(ax, (2.5, 2.0), (4.2, 3.9), "Evaluation query", offset=(-0.25, -0.45))
    _arrow(ax, (7.5, 7.2), (6.9, 6.0), "Historical applications\n(307,511 records)", offset=(1.35, 0.35))
    _arrow(ax, (6.9, 4.3), (7.5, 2.8), "Trained models,\nmetrics & figures", offset=(1.25, 0.2))

    _save(fig, "dfd_level0.png")


# ----------------------------------------------------------------------------- DFD L1
def dfd_level1():
    fig, ax = _canvas(13, 7.5, "Data Flow Diagram (Level 1) — Home Credit Loan-Default Prediction Pipeline")

    _box(ax, 0.1, 7.6, 1.9, 1.2, "Home Credit\nDataset (Kaggle)", ENTITY_FC, ENTITY_EC, fontsize=9.5, bold=True)
    _box(ax, 0.1, 0.6, 1.9, 1.2, "Credit\nAnalyst", ENTITY_FC, ENTITY_EC, fontsize=10, bold=True)

    _box(ax, 2.7, 7.5, 2.0, 1.4, "1.1\nLoad & Cache\n(data_loader)", PROCESS_FC, PROCESS_EC, fontsize=9.5, bold=True)
    _box(ax, 5.6, 7.5, 2.2, 1.4, "1.2\nPreprocess &\nEngineer Features\n(preprocessing)", PROCESS_FC, PROCESS_EC, fontsize=9, bold=True)
    _box(ax, 8.6, 7.5, 2.0, 1.4, "1.3\nTrain Models\n(LR / RF / XGBoost)", PROCESS_FC, PROCESS_EC, fontsize=9.5, bold=True)
    _box(ax, 8.6, 4.2, 2.0, 1.4, "1.4\nEvaluate Models\n(evaluation)", PROCESS_FC, PROCESS_EC, fontsize=9.5, bold=True)
    _box(ax, 4.6, 0.5, 2.4, 1.4, "1.5\nStreamlit Dashboard\n(overview, comparison,\nlive prediction)", PROCESS_FC, PROCESS_EC, fontsize=8.8, bold=True)

    _box(ax, 2.8, 5.0, 1.8, 1.0, "D1  application_\ntrain.csv", STORE_FC, STORE_EC, fontsize=9)
    _box(ax, 5.8, 5.0, 1.8, 1.0, "D2  Parquet\ncache", STORE_FC, STORE_EC, fontsize=9)
    _box(ax, 11.2, 7.7, 1.7, 1.0, "D3  models_store\n(.joblib)", STORE_FC, STORE_EC, fontsize=8.8)
    _box(ax, 11.2, 4.4, 1.7, 1.0, "D4  reports/\nmetrics & figures", STORE_FC, STORE_EC, fontsize=8.8)

    _arrow(ax, (2.0, 8.2), (2.7, 8.2), "raw CSV", offset=(0, 0.18), fontsize=8.5)
    _arrow(ax, (3.7, 7.5), (3.7, 6.0), "", )
    _arrow(ax, (4.6, 5.5), (5.8, 5.5), "cache write/read", offset=(0.1, 0.2), fontsize=8.5)
    _arrow(ax, (6.7, 6.0), (6.7, 7.5), "cached table\n(sentinel fixed)", offset=(0.95, 0.0), fontsize=8.5)
    _arrow(ax, (4.7, 8.2), (5.6, 8.2), "validated\ndataframe", offset=(0, 0.28), fontsize=8.5)
    _arrow(ax, (7.8, 8.2), (8.6, 8.2), "X, y (train/test\nstratified 80/20)", offset=(0, 0.3), fontsize=8.5)
    _arrow(ax, (10.6, 8.2), (11.2, 8.2), "fitted pipelines", offset=(0, 0.18), fontsize=8)
    _arrow(ax, (9.6, 7.5), (9.6, 5.6), "hold-out\npredictions", offset=(0.75, 0.0), fontsize=8.5)
    _arrow(ax, (10.6, 4.9), (11.2, 4.9), "metrics.csv,\nROC & CM plots", offset=(0.05, 0.35), fontsize=8)
    _arrow(ax, (8.6, 4.5), (7.0, 1.6), "metrics table\n& figures", offset=(0.75, 0.15), fontsize=8.5)
    _arrow(ax, (11.6, 7.7), (7.0, 1.3), "loaded models (XGBoost live scoring)",
           offset=(1.1, -0.2), fontsize=8.5, connection="arc3,rad=0.25")
    _arrow(ax, (4.6, 1.2), (2.0, 1.2), "risk score, band\n& charts", offset=(0, 0.35), fontsize=8.5)
    _arrow(ax, (2.0, 0.9), (4.6, 0.9), "applicant details", offset=(0, -0.3), fontsize=8.5)

    _save(fig, "dfd_level1.png")


# ----------------------------------------------------------------------------- ERD
def erd():
    fig, ax = _canvas(13, 8.5, "Entity-Relationship Diagram — Home Credit Default Risk Schema")

    def table(x, y, w, title, rows, fontsize=8.6):
        head_h = 0.55
        row_h = 0.34
        h = head_h + row_h * len(rows)
        _box(ax, x, y, w, h, "", "white", ENTITY_EC, rounded=False)
        _box(ax, x, y + h - head_h, w, head_h, title, ENTITY_FC, ENTITY_EC, fontsize=10, bold=True, rounded=False)
        for i, r in enumerate(rows):
            ax.text(x + 0.12, y + h - head_h - (i + 0.5) * row_h, r,
                    ha="left", va="center", fontsize=fontsize, family="monospace")
        return (x, y, w, h)

    app = table(4.0, 5.2, 2.9, "APPLICATION", [
        "PK SK_ID_CURR",
        "   TARGET (0/1)",
        "   AMT_INCOME_TOTAL",
        "   AMT_CREDIT",
        "   AMT_ANNUITY",
        "   DAYS_BIRTH",
        "   DAYS_EMPLOYED",
        "   EXT_SOURCE_1/2/3",
        "   NAME_EDUCATION_TYPE",
    ])
    bureau = table(0.3, 5.6, 2.6, "BUREAU", [
        "PK SK_ID_BUREAU",
        "FK SK_ID_CURR",
        "   AMT_CREDIT_SUM",
        "   CREDIT_ACTIVE",
    ])
    bb = table(0.3, 2.6, 2.6, "BUREAU_BALANCE", [
        "FK SK_ID_BUREAU",
        "   MONTHS_BALANCE",
        "   STATUS",
    ])
    prev = table(8.2, 6.2, 2.9, "PREVIOUS_APPLICATION", [
        "PK SK_ID_PREV",
        "FK SK_ID_CURR",
        "   AMT_APPLICATION",
        "   NAME_CONTRACT_STATUS",
    ])
    pos = table(8.2, 3.6, 2.9, "POS_CASH_BALANCE", [
        "FK SK_ID_CURR, SK_ID_PREV",
        "   MONTHS_BALANCE",
    ])
    inst = table(8.2, 1.4, 2.9, "INSTALLMENTS_PAYMENTS", [
        "FK SK_ID_CURR, SK_ID_PREV",
        "   AMT_PAYMENT",
    ])
    cc = table(4.0, 1.2, 2.9, "CREDIT_CARD_BALANCE", [
        "FK SK_ID_CURR, SK_ID_PREV",
        "   AMT_BALANCE",
    ])

    def rel(p1, p2, label):
        _arrow(ax, p1, p2, label, offset=(0, 0.2), fontsize=8.5, style="-")

    rel((4.0, 7.2), (2.9, 7.2), "1 : N")
    rel((1.6, 5.6), (1.6, 3.9), "1 : N")
    rel((6.9, 7.4), (8.2, 7.6), "1 : N")
    rel((6.9, 6.4), (8.2, 4.6), "1 : N")
    rel((6.9, 5.8), (8.2, 2.4), "1 : N")
    rel((5.4, 5.2), (5.4, 3.0), "1 : N")

    ax.text(5.0, 0.35,
            "All child tables join APPLICATION on SK_ID_CURR; BUREAU_BALANCE joins BUREAU on SK_ID_BUREAU.\n"
            "The deployed single-table model uses APPLICATION only (307,511 rows x 122 columns).",
            ha="center", fontsize=9.5, style="italic", color="#404040")

    _save(fig, "erd.png")


# ----------------------------------------------------------------------------- UML
def uml_class():
    fig, ax = _canvas(13, 8, "UML Class Diagram — Home Credit Prediction Codebase (src/)")

    def cls(x, y, w, title, attrs, methods, fontsize=8.2):
        rows = attrs + (["—" * 18] if attrs and methods else []) + methods
        head_h = 0.5
        row_h = 0.32
        h = head_h + row_h * len(rows)
        _box(ax, x, y, w, h, "", "white", PROCESS_EC, rounded=False)
        _box(ax, x, y + h - head_h, w, head_h, title, PROCESS_FC, PROCESS_EC, fontsize=9.5, bold=True, rounded=False)
        for i, r in enumerate(rows):
            ax.text(x + 0.1, y + h - head_h - (i + 0.5) * row_h, r,
                    ha="left", va="center", fontsize=fontsize, family="monospace")

    cls(0.3, 6.0, 2.9, "data_loader",
        ["RAW_FILENAME", "DAYS_EMPLOYED_SENTINEL"],
        ["+load_home_credit()", "+sample_home_credit()"])
    cls(3.9, 6.0, 3.1, "preprocessing",
        ["MAX_MISSING_FRACTION=0.60", "ENGINEERED_COLS[6]"],
        ["+clean_data()", "+engineer_features()", "+build_features()",
         "+make_column_transformer()", "+stratified_split()", "+build_pipeline()"])
    cls(7.8, 6.4, 2.7, "evaluation",
        ["EvalResult(dataclass)"],
        ["+evaluate()", "+plot_confusion_matrix()", "+plot_roc_curve()",
         "+compare_models()", "+kfold_scores()"])
    cls(0.3, 2.6, 2.9, "models.logistic_regression",
        ["class_weight='balanced'"], ["+train_and_evaluate()"])
    cls(3.9, 2.6, 3.1, "models.random_forest",
        ["class_weight=", "  'balanced_subsample'"], ["+train_and_evaluate()"])
    cls(7.8, 2.6, 2.7, "models.xgboost_model",
        ["scale_pos_weight≈11"], ["+train_and_evaluate()"])
    cls(10.9, 6.6, 1.9, "utils", [], ["+get_logger()", "+timed()", "+ensure_dir()"])
    cls(10.9, 2.8, 1.9, "dashboard.app", [], ["+page_overview()", "+page_models()", "+page_predict()"])

    for x in (1.7, 5.4, 9.1):
        _arrow(ax, (x, 6.0), (x, 5.0), "", style="-|>", connection="arc3,rad=0")
    ax.text(5.3, 5.45, "models.* depend on data_loader + preprocessing + evaluation",
            ha="center", fontsize=9, style="italic", color="#404040")
    _arrow(ax, (10.9, 3.3), (10.5, 3.3), "")
    ax.text(9.9, 1.9, "dashboard loads saved pipelines (joblib) and reuses build_features",
            ha="center", fontsize=8.5, style="italic", color="#404040")

    _save(fig, "uml_class.png")


# ----------------------------------------------------------------------------- Flowchart
def flowchart():
    fig, ax = _canvas(8.5, 10, "Preprocessing Flowchart — Home Credit application_train.csv")

    steps = [
        ("application_train.csv\n(307,511 rows x 122 cols)", ENTITY_FC, ENTITY_EC),
        ("Load & cache (parquet);\nreplace DAYS_EMPLOYED sentinel 365243 with NaN", PROCESS_FC, PROCESS_EC),
        ("clean_data: drop exact duplicates;\nreport missing footprint (rows kept)", PROCESS_FC, PROCESS_EC),
        ("engineer_features: 6 ratios\n(AGE_YEARS, YEARS_EMPLOYED, CREDIT_INCOME_RATIO,\nANNUITY_INCOME_RATIO, CREDIT_TERM, EMPLOYED_AGE_RATIO)", PROCESS_FC, PROCESS_EC),
        ("select_feature_columns: drop SK_ID_CURR & TARGET,\ncolumns >=60% missing, FLAG_DOCUMENT_*", PROCESS_FC, PROCESS_EC),
        ("ColumnTransformer\nnumeric: median impute -> StandardScaler\ncategorical: mode impute -> OneHotEncoder(ignore unknown)", PROCESS_FC, PROCESS_EC),
        ("stratified_split: 80/20 hold-out,\npreserves ~8.1% default rate", PROCESS_FC, PROCESS_EC),
        ("Model-ready X_train / X_test / y_train / y_test", STORE_FC, STORE_EC),
    ]

    n = len(steps)
    top, bottom = 9.3, 0.4
    gap = (top - bottom) / n
    h = gap * 0.62
    for i, (text, fc, ec) in enumerate(steps):
        y = top - i * gap - h
        _box(ax, 1.2, y, 7.6, h, text, fc, ec, fontsize=9.3, bold=(i in (0, n - 1)))
        if i < n - 1:
            _arrow(ax, (5.0, y), (5.0, y - (gap - h)), "")

    _save(fig, "flowchart_preprocessing.png")


if __name__ == "__main__":
    dfd_level0()
    dfd_level1()
    erd()
    uml_class()
    flowchart()
    print("all diagrams written to", OUT_DIR)
