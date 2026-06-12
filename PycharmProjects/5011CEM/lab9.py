# 1. K-Means Clustering with Python
import random
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
import pandas as pd
cust_df = pd.read_csv("data/Cust_Segmentation.csv")
cust_df.head()

df = cust_df.drop('Address', axis=1)
df.head()

from sklearn.preprocessing import StandardScaler
features_to_scale = [
    'Age',
    'Edu',
    'Years Employed',
    'Income',
    'Card Debt',
    'Other Debt',
    'DebtIncomeRatio'
]

scaler = StandardScaler()

X = scaler.fit_transform(df[features_to_scale])
print(df)

clusterNum = 3
k_means = KMeans(init = "k-means++", n_clusters = clusterNum, n_init = 12)
k_means.fit(X)
labels = k_means.labels_
#print(labels)

df["Clus_km"] = labels
df.head(5)

df.groupby('Clus_km').mean()

area = np.pi * ( X[:, 1])**2
plt.scatter(df['Age'], df['Income'], c=labels.astype(float), alpha=0.5)
plt.xlabel('Age', fontsize=18)
plt.ylabel('Income', fontsize=16)
plt.show()

# 2. K-Means Clustering with Pyspark
from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.clustering import KMeans

import matplotlib.pyplot as plt
import numpy as np

spark = SparkSession.builder.appName("CustomerSegmentation").getOrCreate()

df = spark.read.csv("data/Cust_Segmentation.csv", header=True, inferSchema=True)
df.show(5)

df = df.drop("Address")
df.show(5)

features = [
    'Age',
    'Edu',
    'Years Employed',
    'Income',
    'Card Debt',
    'Other Debt',
    'DebtIncomeRatio'
]

assembler = VectorAssembler(inputCols=features, outputCol="features")
df_vector = assembler.transform(df)

scaler = StandardScaler(inputCol="features", outputCol="scaledFeatures", withMean=True, withStd=True)

scaler_model = scaler.fit(df_vector)
df_scaled = scaler_model.transform(df_vector)

kmeans = KMeans(featuresCol="scaledFeatures", k=3, seed=1)

model = kmeans.fit(df_scaled)

df_clustered = model.transform(df_scaled)
df_clustered.select("scaledFeatures", "prediction").show(5)

df_clustered = df_clustered.withColumnRenamed("prediction", "Clus_km")

df_clustered.groupBy("Clus_km").mean().show()

pandas_df = df_clustered.select("Age", "Income", "Clus_km").toPandas()

area = np.full(len(pandas_df), 50)

plt.scatter(
    pandas_df['Age'],
    pandas_df['Income'],
    s=area,
    c=pandas_df['Clus_km'],
    alpha=0.5
)

plt.xlabel("Age")
plt.ylabel("Income")
plt.title("K-Means Clusters (PySpark)")
plt.show()
