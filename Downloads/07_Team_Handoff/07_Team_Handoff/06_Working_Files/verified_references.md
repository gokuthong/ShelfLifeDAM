# Verified Reference List — Home Credit Loan-Default Prediction Coursework

All entries verified to exist (June 2026). Themes: (1) ML credit risk, (2) Home Credit dataset, (3) class imbalance, (4) XGBoost/RF/LR, (5) big data banking, (6) ethics/regulation/explainability, (7) EDA/preprocessing/missing data, (8) benchmark studies.

## Foundational algorithm papers (mostly SHARED)

1. Chawla, N.V., Bowyer, K.W., Hall, L.O. and Kegelmeyer, W.P. (2002) 'SMOTE: Synthetic Minority Over-sampling Technique', *Journal of Artificial Intelligence Research*, 16, pp. 321-357. doi:10.1613/jair.953.
   - Introduces SMOTE (synthetic minority oversampling by neighbour interpolation). Themes: 3. SHARED.
   - https://www.jair.org/index.php/jair/article/view/10302

2. Breiman, L. (2001) 'Random forests', *Machine Learning*, 45(1), pp. 5-32. doi:10.1023/A:1010933404324.
   - Proposes the Random Forest ensemble; strong accuracy, robust to overfitting. Themes: 4. SHARED.
   - https://link.springer.com/article/10.1023/A:1010933404324

3. Chen, T. and Guestrin, C. (2016) 'XGBoost: A scalable tree boosting system', *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD '16)*, San Francisco, pp. 785-794. doi:10.1145/2939672.2939785.
   - Regularised gradient boosting, sparsity-aware splits, scales to billions of rows. Themes: 4, 5. BEST FOR THONG (XGBoost focus).
   - https://arxiv.org/abs/1603.02754

4. Lundberg, S.M. and Lee, S.-I. (2017) 'A unified approach to interpreting model predictions', *Advances in Neural Information Processing Systems 30 (NIPS 2017)*, Long Beach, CA. arXiv:1705.07874.
   - SHAP values: game-theoretic per-prediction feature attribution. Themes: 6, 4. SHARED. (Cite without page numbers; page ranges vary between records.)
   - https://arxiv.org/abs/1705.07874

## Credit scoring / loan default ML

5. Hand, D.J. and Henley, W.E. (1997) 'Statistical classification methods in consumer credit scoring: A review', *Journal of the Royal Statistical Society: Series A*, 160(3), pp. 523-541. doi:10.1111/j.1467-985X.1997.00078.x.
   - Classic review establishing logistic regression as industry baseline. Themes: 1, 4. BEST FOR BRYAN (LR baseline / EDA report).
   - https://academic.oup.com/jrsssa/article/160/3/523/7102381

6. Baesens, B., Van Gestel, T., Viaene, S., Stepanova, M., Suykens, J. and Vanthienen, J. (2003) 'Benchmarking state-of-the-art classification algorithms for credit scoring', *Journal of the Operational Research Society*, 54(6), pp. 627-635. doi:10.1057/palgrave.jors.2601545.
   - 17 classifiers on 8 real credit datasets; simple linear models often competitive. Themes: 8, 1. BEST FOR BRYAN.
   - https://ideas.repec.org/a/pal/jorsoc/v54y2003i6d10.1057_palgrave.jors.2601545.html

7. Lessmann, S., Baesens, B., Seow, H.-V. and Thomas, L.C. (2015) 'Benchmarking state-of-the-art classification algorithms for credit scoring: An update of research', *European Journal of Operational Research*, 247(1), pp. 124-136. doi:10.1016/j.ejor.2015.05.030.
   - 41 classifiers, ensembles (incl. RF) beat logistic regression. Themes: 8, 1, 4. SHARED (key justification for LR vs RF vs XGB comparison).
   - https://www.sciencedirect.com/science/article/abs/pii/S0377221715004208

8. Xia, Y., Liu, C., Li, Y. and Liu, N. (2017) 'A boosted decision tree approach using Bayesian hyper-parameter optimization for credit scoring', *Expert Systems with Applications*, 78, pp. 225-241. doi:10.1016/j.eswa.2017.02.017.
   - XGBoost + Bayesian hyperparameter optimisation for credit scoring. Themes: 1, 4, 8. BEST FOR THONG.
   - https://www.researchgate.net/publication/313590088

9. Li, H. and Wu, W. (2024) 'Loan default predictability with explainable machine learning', *Finance Research Letters*, 60, 104867. doi:10.1016/j.frl.2023.104867.
   - Nine ML models; RF most efficient/stable; SHAP identifies key default drivers. Themes: 1, 6. BEST FOR THONG.
   - https://ideas.repec.org/a/eee/finlet/v60y2024ics1544612323012394.html

## Home Credit dataset studies

10. Al-qerem, A., Al-Naymat, G. and Alhasan, M. (2019) 'Loan default prediction model improvement through comprehensive preprocessing and features selection', *2019 International Arab Conference on Information Technology (ACIT)*, Al Ain, UAE, pp. 235-240. doi:10.1109/ACIT47987.2019.8991084.
    - On Home Credit data: preprocessing + feature selection improves NB/DT/RF up to ~40%. Themes: 2, 7, 3. BEST FOR THONG (preprocessing).
    - https://ieeexplore.ieee.org/document/8991084/

11. Yang, S., Huang, Z., Xiao, W. and Shen, X. (2025) 'Interpretable credit default prediction with ensemble learning and SHAP', arXiv preprint arXiv:2505.20815.
    - LR/RF/XGBoost/LightGBM on Home Credit; ensembles win; EXT_SOURCE scores dominate SHAP. Themes: 2, 1, 3, 6. SHARED (mirrors coursework design exactly).
    - https://arxiv.org/abs/2505.20815

## Class imbalance

12. He, H. and Garcia, E.A. (2009) 'Learning from imbalanced data', *IEEE Transactions on Knowledge and Data Engineering*, 21(9), pp. 1263-1284. doi:10.1109/TKDE.2008.239.
    - Survey: sampling, cost-sensitive learning, ROC/PR metrics when accuracy misleads. Themes: 3. BEST FOR THONG.
    - https://www.semanticscholar.org/paper/6a97303b92477d95d1e6acf7b443ebe19a6beb60

13. XGBoost Developers (2022) 'Notes on parameter tuning', *XGBoost Documentation*. Available at: https://xgboost.readthedocs.io/en/stable/tutorials/param_tuning.html.
    - Official guidance: scale_pos_weight for imbalance + AUC evaluation. Themes: 3, 4. BEST FOR THONG (justifies scale_pos_weight over SMOTE).

## Big data in banking/finance

14. Hasan, M.M., Popp, J. and Olah, J. (2020) 'Current landscape and influence of big data on finance', *Journal of Big Data*, 7(1), Article 21. doi:10.1186/s40537-020-00291-z.
    - Big data reshapes risk management and decision quality in finance. Themes: 5. BEST FOR BRYAN.
    - https://journalofbigdata.springeropen.com/articles/10.1186/s40537-020-00291-z

15. Srivastava, U. and Gopalkrishnan, S. (2015) 'Impact of big data analytics on banking sector: Learning for Indian banks', *Procedia Computer Science*, 50, pp. 643-652. doi:10.1016/j.procs.2015.04.098.
    - Banks' big-data use across fraud, customer behaviour, risk. Themes: 5. BEST FOR BRYAN.
    - https://www.sciencedirect.com/science/article/pii/S1877050915005992

## Ethics, regulation, fairness

16. Kozodoi, N., Jacob, J. and Lessmann, S. (2022) 'Fairness in credit scoring: Assessment, implementation and profit implications', *European Journal of Operational Research*, 297(3), pp. 1083-1094. doi:10.1016/j.ejor.2021.06.023.
    - Fairness criteria for credit scoring; profit-fairness trade-off. Themes: 6, 1. SHARED.
    - https://www.sciencedirect.com/science/article/abs/pii/S0377221721005385

17. Goodman, B. and Flaxman, S. (2017) 'European Union regulations on algorithmic decision-making and a "right to explanation"', *AI Magazine*, 38(3), pp. 50-57. doi:10.1609/aimag.v38i3.2741.
    - GDPR restricts automated decisions; right to explanation for ML credit decisions. Themes: 6. BEST FOR BRYAN.
    - https://onlinelibrary.wiley.com/doi/abs/10.1609/aimag.v38i3.2741

18. European Parliament and Council (2016) *Regulation (EU) 2016/679 (General Data Protection Regulation)*, Article 22. Official Journal of the European Union, L 119.
    - Right not to be subject to solely automated decisions with significant effects. Themes: 6. SHARED.
    - https://gdpr-info.eu/art-22-gdpr/

## EDA, preprocessing, missing data, dashboards

19. Garcia, S., Ramirez-Gallego, S., Luengo, J., Benitez, J.M. and Herrera, F. (2016) 'Big data preprocessing: methods and prospects', *Big Data Analytics*, 1, Article 9. doi:10.1186/s41044-016-0014-0.
    - Preprocessing (cleaning, feature selection, imbalance) at big-data scale. Themes: 7, 5. BEST FOR THONG.

20. Emmanuel, T., Maupong, T., Mpoeleng, D., Semong, T., Mphago, B. and Tabona, O. (2021) 'A survey on missing data in machine learning', *Journal of Big Data*, 8, Article 140. doi:10.1186/s40537-021-00516-9.
    - MCAR/MAR/MNAR mechanisms and imputation strategies. Themes: 7. BEST FOR BRYAN (justifies median/mode imputation).
    - https://pmc.ncbi.nlm.nih.gov/articles/PMC8549433/

21. Sarikaya, A., Correll, M., Bartram, L., Tory, M. and Fisher, D. (2019) 'What do we talk about when we talk about dashboards?', *IEEE Transactions on Visualization and Computer Graphics*, 25(1), pp. 682-692. doi:10.1109/TVCG.2018.2864903.
    - Dashboard design dimensions by audience and decision-support goal. Themes: 7. BEST FOR BRYAN (dashboard focus).
    - https://ieeexplore.ieee.org/document/8443395/

## Allocation summary

- **Bryan (EDA/LR/RF/dashboard focus), primary:** #5, #6, #14, #15, #17, #20, #21 + shared.
- **Thong (preprocessing/XGBoost/evaluation focus), primary:** #3, #8, #9, #10, #12, #13, #19 + shared.
- **Shared core:** #1, #2, #4, #7, #11, #16, #18.
- Each student ends with 14-15 citable references, overlapping only on the 7 shared.
