# Study Materials

This folder contains the experimental apparatus to run the study, as well as the data tables for this study.

The study requires PHP and javascript to run successfully.

The data are contained in the [Data](data/) folder.

`demo.csv` contains anonymized information about the study participants in each experiment.
`rawData.csv` contains the responses for all participants, with the following columns:

* `id`: The anonymized participant ID.
* `index`: The order of the trial in the participant's study. There were 90 trials, with the first 9 being for training purposes only.
* `distribution` : The null distribution. Our study supports multiple types of distributions, but we used only the `normal` (a Gaussian with mean of 0.5 and std. dev. of 0.15) for the study in the paer.
* `flaw` : What type of data flaw the participant was meant to detect (one of `spike`, `gap`, or `outliers`).
* `magnitude` : How many points, out of 50 total sample points, made up this flaw.
* `vis` : What type of visualizations the participant saw (one of `density` for a density plot, `scatter` for a dot plot, or `histogram`).
* `parameter` : The design parameter of the visualizations. The kernel bandwidth of the density plot, the mark opacity of the scatterplot, or the number of bins in the histogram.
* `training` : Whether this trial was one of the initial 9 training stimuli (1) or not (0). We excluded training stimuli from analysis.
* `correct` : Whether the participant chose the correct visualization (the one with the flaw) from the lineup (1) or not (0).
* `rt`: The time between clicking the ready button, and confirming a response, in milliseconds.
* `vizIndex`: Which visualization the participant clicked on, from "viz1" (the visualization in the top left corner of the 5x4 lineup grid) to "viz20" (the visualization in the bottom right corner).
* `excluded`: Whether the performance of this participant on training trials was so poor as to justify exclusion from our analysis (1) or not (0).

The data we used for our main analysis is `cleanData.csv`, which is `rawData.csv` but with training stimuli, participants who did not complete the task, participants who did not successfully answer any of the training stimuli, and any duplicate rows excluded. 

[analysis.R](data/analysis.R) is the R script used to conduct the analyses in the paper. Additionally, [vegalite_specs](data/vegalite_specs) contains [Vega-Lite](https://vega.github.io/vega-lite/) JSON specifications for generating the figures we use in the paper.
