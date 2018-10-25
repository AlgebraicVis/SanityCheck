# Looks Good To Me: Visualizations As Sanity Checks
This repository contains supporting information for our submission to [InfoVis 2018](http://ieeevis.org/year/2018/welcome), *Looks Good To Me: Visualizations As Sanity Checks*. A preprint of the paper is available [here](InfoVis/preprint.pdf). For a shorter explanation of our project and its goals, read our [Medium post](https://medium.com/@mcorrell/looks-good-to-me-visualizations-as-sanity-checks-6fd1ffa37ab9?_branch_match_id=522595179363415786).

It is also part of a larger project of examining *Black Hat Visualization*: can visualizations designed unthinkingly or maliciously *hide* important information from analysts, or otherwise *mislead* people? We lay out this concept in a [position paper](DECISIVe/Paper.pdf) for the [DECISIVe 2017](http://decisive-workshop.dbvis.de/) workshop.

## Contents

Our InfoVis paper focuses on univariate visualizations as "sanity checks": that is, visualizations that are meant to be glanced at to confirm that a given data set is reasonably free from data quality issues or other "badness." Our contention was that the *adversarial* design of these visualizations could result in visualizations that look plausible (that is, they seem to show an error-free "good" distribution), but make the flaw difficult to see, or indistinguishable from ordinary noise or sampling error.

This [Attack](attack/) folder contains code for generating adversarial univariate visualizations: that is, given a dataset into which I have injected one or more data quality issues (extraneous modes, noise, mean shifts, etc.), what is the visualization of the "bad" data that I can generate that will look the most similar to my visualization of "good" data?

The [Study](study/) folder contains our experimental apparatus, analysis script, and data tables, including a data dictionary. We performed a [lineup task](http://vita.had.co.nz/papers/inference-infovis.pdf), where participants had to identify one instance of "bad" data amongst a set of "good" datasets. More details about our methodology are available in the [paper](InfoVis/preprint.pdf) as well as our [slides](InfoVis/slides.pdf).
