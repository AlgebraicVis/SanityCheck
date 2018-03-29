# Adversarial Univariate Visualizations
Code related to whether or not visualizations can function as appropriate "sanity checks" of distributional data. 

This [Main](/) folder contains code for generating adversarial visualizations: that is, given a dataset into which I have injected one or more data quality issues (extraneous modes, noise, mean shifts, etc.), what is the visualization of the "bad" data that I can generate that will look the most similar to my visualization of "good" data?
The [Study](study/) folder contains our experimental apparatus and study results. We performed a [lineup task](http://vita.had.co.nz/papers/inference-infovis.pdf), where participants had to identify one instance of "bad" data amongst a set of "good" datasets.
