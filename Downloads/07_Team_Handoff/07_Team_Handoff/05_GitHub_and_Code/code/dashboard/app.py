"""Streamlit dashboard for the Home Credit Default Risk project.

Three pages:
1. Overview - headline KPIs and charts summarising the application data.
2. Model Comparison - side-by-side metrics for the three classifiers, plus their
   confusion matrices and ROC curves.
3. Live Prediction - a form where a user enters a handful of applicant details and
   sees the default probability predicted by XGBoost. Unspecified features are filled
   with the training medians/modes (a "typical applicant").

Run with:
    streamlit run dashboard/app.py
"""

from __future__ import annotations

import joblib
import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

from src.data_loader import sample_home_credit
from src.preprocessing import build_features
from src.utils import MODELS_DIR, FIGURES_DIR

DAYS_PER_YEAR = 365.25
REPAID_COLOUR = "#4C72B0"
DEFAULT_COLOUR = "#C44E52"

st.set_page_config(
    page_title="Home Credit Default Risk",
    page_icon="bank",
    layout="wide",
)


@st.cache_resource
def load_models() -> dict:
    """Load all trained models once and cache them in memory."""
    models = {}
    for name, fname in [
        ("Logistic Regression", "logistic_regression.joblib"),
        ("Random Forest", "random_forest.joblib"),
        ("XGBoost", "xgboost.joblib"),
    ]:
        path = MODELS_DIR / fname
        if path.exists():
            models[name] = joblib.load(path)
    return models


@st.cache_data
def load_sample_data() -> pd.DataFrame:
    """Load a stratified sample for the dashboard charts."""
    try:
        return sample_home_credit(n=50_000)
    except FileNotFoundError:
        st.warning(
            "application_train.csv not found in data/. Place it there and refresh to "
            "see the live charts."
        )
        return pd.DataFrame()


@st.cache_data
def load_feature_template() -> tuple[pd.DataFrame, dict[str, list[str]]]:
    """Build a one-row 'typical applicant' record plus categorical option lists.

    The record carries the exact feature columns the models were trained on, filled with
    the sample medians (numeric) and modes (categorical). The live-prediction form overrides
    a handful of these and recomputes the dependent ratios before predicting.
    """
    sample = load_sample_data()
    if sample.empty:
        return pd.DataFrame(), {}
    X, _ = build_features(sample)
    numeric = X.select_dtypes(include=np.number).columns
    categorical = X.select_dtypes(exclude=np.number).columns

    record = {c: float(X[c].median()) for c in numeric}
    record.update({c: X[c].mode().iloc[0] for c in categorical})
    template = pd.DataFrame([record])[X.columns]

    options = {c: sorted(X[c].dropna().unique().tolist()) for c in categorical}
    return template, options


@st.cache_data
def sample_score_distribution() -> np.ndarray:
    """XGBoost predicted scores across the sample, used to interpret a single score.

    Because the models correct for the 8% imbalance, their raw probabilities are inflated
    (good for *ranking* risk, not calibrated to the true rate). Comparing an applicant's
    score against this distribution turns it into an interpretable Low/Moderate/High band.
    """
    sample = load_sample_data()
    models = load_models()
    if sample.empty or "XGBoost" not in models:
        return np.array([])
    X, _ = build_features(sample)
    return models["XGBoost"].predict_proba(X)[:, 1]


@st.cache_data
def load_metrics() -> pd.DataFrame:
    """Load the real metrics table written by ``run_pipeline.py``.

    Returns an empty frame if the pipeline has not been run yet, so the page degrades
    gracefully.
    """
    path = FIGURES_DIR.parent / "metrics.csv"
    if not path.exists():
        return pd.DataFrame()
    df = pd.read_csv(path)
    return df.rename(
        columns={
            "model_name": "Model",
            "accuracy": "Accuracy",
            "precision": "Precision",
            "recall": "Recall",
            "f1": "F1",
            "roc_auc": "ROC-AUC",
        }
    )


def page_overview() -> None:
    st.header("Dataset Overview")
    df = load_sample_data()
    if df.empty:
        return

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Rows in sample", f"{len(df):,}")
    col2.metric("Default cases", f"{int(df.TARGET.sum()):,}")
    col3.metric("Default rate", f"{df.TARGET.mean() * 100:.2f}%")
    col4.metric("Median credit", f"{df.AMT_CREDIT.median():,.0f}")

    st.subheader("Default rate by education level")
    by_edu = df.groupby("NAME_EDUCATION_TYPE", observed=True).TARGET.mean().reset_index()
    by_edu["TARGET"] *= 100
    fig = px.bar(
        by_edu.sort_values("TARGET", ascending=False),
        x="TARGET", y="NAME_EDUCATION_TYPE", orientation="h",
        color="TARGET", color_continuous_scale="Reds",
        labels={"TARGET": "Default rate (%)", "NAME_EDUCATION_TYPE": "Education"},
    )
    st.plotly_chart(fig, use_container_width=True)

    col_a, col_b = st.columns(2)
    with col_a:
        st.subheader("Credit amount by outcome")
        fig2 = px.box(
            df.sample(n=min(len(df), 20_000), random_state=42),
            x="TARGET", y="AMT_CREDIT", log_y=True, color="TARGET",
            color_discrete_map={0: REPAID_COLOUR, 1: DEFAULT_COLOUR},
            labels={"TARGET": "Default (1) vs repaid (0)", "AMT_CREDIT": "Credit amount"},
        )
        st.plotly_chart(fig2, use_container_width=True)
    with col_b:
        st.subheader("Default rate by gender")
        by_gender = df[df.CODE_GENDER != "XNA"].groupby(
            "CODE_GENDER", observed=True).TARGET.mean().reset_index()
        by_gender["TARGET"] *= 100
        fig3 = px.bar(
            by_gender, x="CODE_GENDER", y="TARGET", color="TARGET",
            color_continuous_scale="Reds",
            labels={"TARGET": "Default rate (%)", "CODE_GENDER": "Gender"},
        )
        st.plotly_chart(fig3, use_container_width=True)


def page_models() -> None:
    st.header("Model Comparison")
    metrics = load_metrics()
    if metrics.empty:
        st.info(
            "No metrics found. Run `python run_pipeline.py` to train the models and "
            "generate `reports/metrics.csv`."
        )
    else:
        st.dataframe(
            metrics.style.format(
                {"Accuracy": "{:.4f}", "Precision": "{:.4f}", "Recall": "{:.4f}",
                 "F1": "{:.4f}", "ROC-AUC": "{:.4f}"}
            ),
            use_container_width=True,
        )
        st.caption(
            "At ~8% defaults, accuracy is misleading. XGBoost gives the best F1 and ROC-AUC; "
            "Logistic Regression is the interpretable baseline."
        )

    tuned = FIGURES_DIR.parent / "threshold_metrics.csv"
    if tuned.exists():
        st.subheader("Decision-threshold tuning")
        tuned_df = pd.read_csv(tuned)
        st.dataframe(
            tuned_df.style.format(
                {c: "{:.3f}" for c in tuned_df.columns if c != "model"}
            ),
            use_container_width=True,
        )
        st.caption(
            "Metrics at the default 0.5 cut-off versus the F1-maximising threshold found "
            "on the hold-out set (`python optimise_models.py`). Tuning the threshold trades "
            "some recall for a much better precision/F1 balance without retraining."
        )

    st.subheader("Confusion matrices and ROC curves")
    cols = st.columns(3)
    for col, model_slug in zip(cols, ["logistic_regression", "random_forest", "xgboost"]):
        cm = FIGURES_DIR / f"cm_{model_slug}.png"
        roc = FIGURES_DIR / f"roc_{model_slug}.png"
        if cm.exists():
            col.image(str(cm), caption=f"Confusion matrix - {model_slug}")
        if roc.exists():
            col.image(str(roc), caption=f"ROC - {model_slug}")

    st.subheader("Optimisation diagnostics")
    for fname, caption in [
        ("threshold_sweep.png", "Precision/recall/F1 across decision thresholds"),
        ("calibration_curves.png", "Calibration (reliability) curves with Brier scores"),
        ("feature_importance.png", "Top-15 global feature importances per model"),
    ]:
        path = FIGURES_DIR / fname
        if path.exists():
            st.image(str(path), caption=caption)


def page_predict() -> None:
    st.header("Live Default-Risk Prediction")
    st.write(
        "Enter the applicant details below. The deployed model (XGBoost) returns the "
        "probability that the loan ends in payment difficulty. Unspecified fields are set "
        "to the typical (median/most-common) applicant."
    )

    models = load_models()
    template, options = load_feature_template()
    if "XGBoost" not in models:
        st.info("XGBoost model is not yet trained. Run `python run_pipeline.py` first.")
        return
    if template.empty:
        return

    with st.form("predict_form"):
        col1, col2 = st.columns(2)
        with col1:
            income = st.number_input("Annual income", min_value=10_000.0, value=150_000.0, step=10_000.0)
            credit = st.number_input("Credit amount", min_value=10_000.0, value=500_000.0, step=10_000.0)
            annuity = st.number_input("Loan annuity", min_value=1_000.0, value=25_000.0, step=1_000.0)
            age = st.slider("Age (years)", min_value=21, max_value=69, value=40)
        with col2:
            education = st.selectbox("Education", options.get("NAME_EDUCATION_TYPE", []))
            family = st.selectbox("Family status", options.get("NAME_FAMILY_STATUS", []))
            gender = st.selectbox("Gender", options.get("CODE_GENDER", []))
            ext2 = st.slider("External score (EXT_SOURCE_2)", 0.0, 1.0, 0.5, step=0.01)

        submitted = st.form_submit_button("Predict default risk")

    if submitted:
        record = template.copy()
        record.loc[0, "AMT_INCOME_TOTAL"] = income
        record.loc[0, "AMT_CREDIT"] = credit
        record.loc[0, "AMT_ANNUITY"] = annuity
        record.loc[0, "DAYS_BIRTH"] = -age * DAYS_PER_YEAR
        record.loc[0, "AGE_YEARS"] = age
        record.loc[0, "EXT_SOURCE_2"] = ext2
        record.loc[0, "NAME_EDUCATION_TYPE"] = education
        record.loc[0, "NAME_FAMILY_STATUS"] = family
        record.loc[0, "CODE_GENDER"] = gender
        # Keep the engineered ratios consistent with the overridden inputs.
        record.loc[0, "CREDIT_INCOME_RATIO"] = credit / income
        record.loc[0, "ANNUITY_INCOME_RATIO"] = annuity / income
        record.loc[0, "CREDIT_TERM"] = annuity / credit

        proba = models["XGBoost"].predict_proba(record)[0, 1]
        band, colour, percentile = _risk_band(proba)

        st.markdown(f"<h2 style='color:{colour}'>{band} DEFAULT RISK</h2>", unsafe_allow_html=True)
        st.metric("Model default score", f"{proba * 100:.1f}%")
        st.progress(min(float(proba), 1.0))
        st.caption(
            f"Scores higher than ~{percentile:.0f}% of applicants in the sample. The model is "
            "tuned for recall, so the score is a relative risk ranking rather than a calibrated "
            "rate (portfolio base default rate is ~8%)."
        )


def _risk_band(proba: float) -> tuple[str, str, float]:
    """Map a model score to a Low/Moderate/High band using the sample's score quantiles."""
    dist = sample_score_distribution()
    if dist.size == 0:
        return "MODERATE", "#DD8452", 50.0
    q50, q80 = np.quantile(dist, [0.5, 0.8])
    percentile = float((dist < proba).mean() * 100)
    if proba >= q80:
        return "HIGH", DEFAULT_COLOUR, percentile
    if proba >= q50:
        return "MODERATE", "#DD8452", percentile
    return "LOW", REPAID_COLOUR, percentile


PAGES = {"Overview": page_overview, "Model Comparison": page_models, "Live Prediction": page_predict}


def main() -> None:
    st.sidebar.title("Home Credit Default Risk")
    st.sidebar.markdown(
        "5011CEM Big Data Programming Project\n\n"
        "By **Bryan Tey** and **Thong Wai Kit**."
    )
    choice = st.sidebar.radio("Page", list(PAGES.keys()))
    PAGES[choice]()


if __name__ == "__main__":
    main()
