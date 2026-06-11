"""Preprocessing pipeline for the Home Credit Default Risk dataset.

The function ``build_features`` takes the raw application dataframe and returns
a feature matrix ``X`` and the binary label vector ``y`` (``TARGET``: 1 = the
client had payment difficulties, 0 = repaid). The pipeline follows the Week-4
pre-processing steps, adapted to real data with substantial missingness:

1. Clean and validate (drop exact duplicate rows; report missing values rather
   than dropping them -- the missing values are handled by imputation later).
2. Engineer six interpretable, domain-motivated ratios (age in years, credit-to-
   income, annuity-to-income, the loan term, and an employment-to-age ratio).
3. Reduce the feature set: drop the identifier, columns that are more than
   ``MAX_MISSING_FRACTION`` empty (mostly the sparse building-survey block) and
   the low-value ``FLAG_DOCUMENT_*`` indicators.
4. Inside the model pipeline, impute the remaining missing values, scale the
   numeric columns and one-hot encode the categorical columns.

Numeric and categorical columns are selected by dtype at fit time
(``make_column_selector``) rather than hand-listed, so the same pipeline works
unchanged as columns are added or dropped.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer, make_column_selector
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from src.data_loader import ID_COLUMN, TARGET_COLUMN
from src.utils import get_logger

log = get_logger(__name__)

# Columns more than this fraction empty are dropped (the sparse building-survey
# block: COMMONAREA_*, NONLIVINGAPARTMENTS_*, YEARS_BUILD_*, ...). The rest are
# imputed inside the model pipeline.
MAX_MISSING_FRACTION = 0.60

DOC_FLAG_PREFIX = "FLAG_DOCUMENT_"

# Engineered ratio columns, kept as a named list so the EDA notebook and tests
# can refer to them without restating the formulae.
ENGINEERED_COLS = [
    "AGE_YEARS",
    "YEARS_EMPLOYED",
    "CREDIT_INCOME_RATIO",
    "ANNUITY_INCOME_RATIO",
    "CREDIT_TERM",
    "EMPLOYED_AGE_RATIO",
]

_DAYS_PER_YEAR = 365.25


@dataclass
class SplitData:
    X_train: pd.DataFrame
    X_test: pd.DataFrame
    y_train: pd.Series
    y_test: pd.Series


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add six interpretable credit-risk features.

    ``DAYS_BIRTH`` and ``DAYS_EMPLOYED`` are stored as negative day counts
    relative to the application date, so negating and dividing by the days per
    year gives ages and tenures in years. The ratios capture leverage (how large
    the loan is relative to income) and loan structure (annuity relative to
    income and to the credit amount). Divisions that hit a zero denominator are
    set to NaN and imputed downstream.
    """
    out = df.copy()
    out["AGE_YEARS"] = -out["DAYS_BIRTH"] / _DAYS_PER_YEAR
    out["YEARS_EMPLOYED"] = -out["DAYS_EMPLOYED"] / _DAYS_PER_YEAR
    out["CREDIT_INCOME_RATIO"] = out["AMT_CREDIT"] / out["AMT_INCOME_TOTAL"]
    out["ANNUITY_INCOME_RATIO"] = out["AMT_ANNUITY"] / out["AMT_INCOME_TOTAL"]
    out["CREDIT_TERM"] = out["AMT_ANNUITY"] / out["AMT_CREDIT"]
    out["EMPLOYED_AGE_RATIO"] = out["DAYS_EMPLOYED"] / out["DAYS_BIRTH"]
    out[ENGINEERED_COLS] = out[ENGINEERED_COLS].replace([np.inf, -np.inf], np.nan)
    return out


def clean_data(df: pd.DataFrame, drop_duplicates: bool = True) -> pd.DataFrame:
    """Data cleaning and validation (the Week-4 "cleaning" and "validation" steps).

    Removes exact duplicate rows and reports the missing-value footprint. Unlike a
    dataset with no missing values, Home Credit is ~24% missing overall, so rows are
    *not* dropped -- the missing values are imputed inside the model pipeline. Logging
    the footprint keeps the cleaning step explicit and honest.
    """
    out = df
    n_missing = int(df.isnull().sum().sum())
    n_cols_missing = int((df.isnull().mean() > 0).sum())
    log.info(
        "clean_data: %d missing cells across %d columns (imputed later, rows kept)",
        n_missing, n_cols_missing,
    )
    if drop_duplicates:
        before = len(out)
        out = out.drop_duplicates()
        log.info(
            "clean_data: removed %d duplicate rows (%d -> %d)",
            before - len(out), before, len(out),
        )
    return out


def select_feature_columns(df: pd.DataFrame) -> list[str]:
    """Choose the feature columns: drop the id/target, high-missing and document flags.

    The threshold rule avoids hand-listing 122 columns: anything at least
    ``MAX_MISSING_FRACTION`` empty is dropped (the sparse building-survey block), as
    are the ``FLAG_DOCUMENT_*`` indicators, which carry little signal.
    """
    missing_frac = df.isnull().mean()
    high_missing = missing_frac[missing_frac >= MAX_MISSING_FRACTION].index
    doc_flags = [c for c in df.columns if c.startswith(DOC_FLAG_PREFIX)]
    dropped = {ID_COLUMN, TARGET_COLUMN, *high_missing, *doc_flags}
    kept = [c for c in df.columns if c not in dropped]
    log.info(
        "select_feature_columns: kept %d of %d columns "
        "(dropped %d high-missing, %d document flags)",
        len(kept), df.shape[1], len(high_missing), len(doc_flags),
    )
    return kept


def build_features(df: pd.DataFrame, clean: bool = True) -> Tuple[pd.DataFrame, pd.Series]:
    """Run the full preprocessing pipeline and return ``X`` and ``y`` (``TARGET``)."""
    work = clean_data(df) if clean else df.copy()
    work = engineer_features(work)

    y = work[TARGET_COLUMN].astype("int64")
    X = work[select_feature_columns(work)]
    return X, y


def make_column_transformer() -> ColumnTransformer:
    """Build the sklearn ColumnTransformer used by the modelling pipelines.

    Numeric columns are median-imputed then standardised; categorical columns are
    mode-imputed then one-hot encoded with ``handle_unknown='ignore'`` so unseen
    categories at prediction time do not raise. Columns are selected by dtype at fit
    time, so the transformer adapts automatically to the engineered features.
    """
    numeric = Pipeline(
        steps=[
            ("impute", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
        ]
    )
    categorical = Pipeline(
        steps=[
            ("impute", SimpleImputer(strategy="most_frequent")),
            ("encode", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("num", numeric, make_column_selector(dtype_include=np.number)),
            ("cat", categorical, make_column_selector(dtype_exclude=np.number)),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )


def stratified_split(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = 0.2,
    random_state: int = 42,
) -> SplitData:
    """Stratified train-test split that preserves the default rate."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    log.info(
        "split: train=%d (positive %.4f%%) test=%d (positive %.4f%%)",
        len(X_train), y_train.mean() * 100,
        len(X_test), y_test.mean() * 100,
    )
    return SplitData(X_train, X_test, y_train, y_test)


def build_pipeline(estimator) -> Pipeline:
    """Wrap any sklearn-style estimator with our preprocessing transformer."""
    return Pipeline(
        steps=[
            ("prep", make_column_transformer()),
            ("clf", estimator),
        ]
    )


if __name__ == "__main__":
    from src.data_loader import load_home_credit

    df = load_home_credit()
    X, y = build_features(df)
    split = stratified_split(X, y)
    print(f"X_train shape: {split.X_train.shape}")
    print(f"y_train default rate: {split.y_train.mean() * 100:.4f}%")
