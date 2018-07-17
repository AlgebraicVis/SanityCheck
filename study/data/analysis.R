#Analysis code for the study connected with our InfoVis 2018 Paper Looks Good To Me: Visualizations As Sanity Checks

#I like the univariate summaries from skimr, even though the results of the paper ironically suggest that they aren't very good
library(skimr)
#I originally ran this with a regular ANOVA, but I think ez_ANOVAs are easier to read for repeated measures studies.
library(ez)

#Cleveland & McGill '84 use 10% trimmed means as measures of central tendency because they are insensitive to
#Outliers and other weirdness we'd expect from a psychophysics-lite experiment like this one.
tmean <- function(x) {
	#10% trimmed means
	return(mean(x,trim=0.1))
}

#C&McG also use bootstrapped confidence intervals since they are not quite so parametric as the regular kind.
tboot <- function(x) {
	#95% bootstrapped confidence intervals of the trimmed means with 1000 samples.
	#Note that these will not be stable confidence intervals! If they differ across runs, don't be scared.
	n = length(x)
	boot.samples = matrix( sample(x,size=n*1000,replace=TRUE), 1000, n)
	boot.statistics = apply(boot.samples,1,tmean)
	interval = c(ci1 = quantile(boot.statistics,0.025,names=FALSE),midmean = tmean(x),ci2 = quantile(boot.statistics,0.975,names=FALSE))
	return(interval)
}

#main analysis

analyis <- function(){
		
	#load in our data
	data <- read.csv("cleandata.csv")
	demo <- read.csv("cleandemo.csv")
	
	#who were our participants?
	print("Participant information")
	
	#cast "experience" from a zero-indexed 0-4 numeric to a 1-5 Likert factor.
	#The participants saw "1-5" radio buttons but I stored it as zero-indexed out of habit.
	demo$experience <- demo$experience+1
	demo$experienceFactor <- factor(demo$experience)
	print(skim(demo[c("gender","age","education","experience","experienceFactor")]))
	
	#does our data look reasonable?
	print(skim(data))
	
	#how good were people, overall?
	print("Overall accuracy")
	print(tboot(data$correct))
	
	#let's build our factorial anova
	#convert parameter from a numeric to a factor, from 1=least conversative to 3=most conversative parameter settings.
	data$parameterFactor <- factor(data$parameter)
	#this means we're in lexical/sorted order, except for histograms, where more bins is more liberal, not less.
	levels(data$parameterFactor) <- c("1","2","3","1","2","3","3","2","1")
	
	#Magnitude could probably stay as a numeric, but I think it makes sense to treat it as a factor as well, since
	#I regard it more as an ordinal factor for this study.
	data$magnitudeFactor <- factor(data$magnitude)

	model <- model_ez <- ezANOVA(data=data, dv = .(correct), wid= .(id), within = .(flaw,magnitudeFactor,vis,parameterFactor))
	
	#what did our model find?
	print("Factorial ANOVA")
	print(model$ANOVA)
	
	#oh cool, flaw type is a significant factor
	#how different was performance across flaws?
	print("Accuracy across flaw types")
	print(with(data,aggregate(correct ~ flaw,FUN=tboot)))
	
	#when was this difference significant?
	#note: my heart tells me to do a Tukey HSD post hoc here, but since we've already hitched our wagon to ezANOVA...
	#I think pairwise t-tests with a Bonferroni correction are more conservative, but much easier to read and present.
	print(pairwise.t.test(data$correct,data$flaw,p.adjust.method="bonferroni"))
	
	#magnitude is also a significant factor, but we mainly care about its interaction with flaw
	print("Accuracy across magnitude of flaw")
	print(with(data,aggregate(correct ~ magnitude,FUN=tboot)))
	
	print("Interaction between flaw type and magnitude")
	#Figure 8 data
	print("Fig 8")
	print(with(data,aggregate(correct ~ magnitude*flaw,FUN=tboot)))
	pairwise.t.test(data$correct,interaction(data$magnitude,data$flaw),p.adjust.method="bonferroni")
	
	#vis type also is a significant factor
	#how different was performance across vis types?
	print("Accuracy across vis types")
	print(with(data,aggregate(correct ~ vis,FUN=tboot)))
	
	#when was this difference significant?
	print(pairwise.t.test(data$correct,data$vis,p.adjust.method="bonferroni"))
	
	#and there's an interaction here as well.	
	print("Interaction of vis type and flaw type")
	print(with(data,aggregate(correct ~ vis*flaw,FUN=tboot)))
	
	#which visualizations were different across different flaws? Did any dominate?
	print(pairwise.t.test(data$correct,interaction(data$vis,data$flaw),p.adjust.method="bonferroni"))
	
	print("Interaction of flaw type and parameter conservativeness")
	#So how did conservativenss of parameters impact flaw detection?
	#I did not design the study to be powerful enough to reliably distinguish between all of these cells.
	#This is more to look for general trends. I think the real interesting bit is the triple interactions with vis type.
	print(with(data,aggregate(correct ~ parameterFactor*flaw,FUN=tboot)))
	print(pairwise.t.test(data$correct,interaction(data$parameterFactor,data$flaw),p.adjust.method="bonferroni"))
	
	#Now to show the full three-way interaction between vis, flaw, and design parameter
	print("Parameter impacts across flaw types")
	#Figure 9a
	print("Fig 9a: Gap Detection")
	print(with(subset(data,flaw=="gap"),aggregate(correct ~ parameter*vis,FUN=tboot)))
	
	#Figure 9b
	print("Fig 9b: Outlier Detection")
	print(with(subset(data,flaw=="outliers"),aggregate(correct ~ parameter*vis,FUN=tboot)))
	
	#Figure 9c
	print("Fig 9c: Spike Detection")
	print(with(subset(data,flaw=="spike"),aggregate(correct ~ parameter*vis,FUN=tboot)))
	
}

analysis()