#!/usr/bin/env python
# coding: utf-8

# In[10]:


import pandas as pd
import json
import folium
from folium.plugins import HeatMap
import os
import locproc


# In[11]:


personfiles = {
    'jakob': 'wolfi4_2020-03-24t15_55_10.999z.json',
    'wolfi': 'wolfi4_2020-03-25t19_29_26.969z.json',
    'steffi': 'wolfi4_2020-03-24t16_32_43.640z.json',
    'tiago': 'tiago9_2020-03-25t20_36_05.925z.json',
    'robert': 'wolfi4_2020-03-26t09_40_57.764z.json'
}


# In[12]:


settings = {
    'coordinate_accuracy': 7,
    'coordinate_cluster_accuracy': 3,
    'coordinate_output_accuracy': 5
}
datadir = os.path.abspath("./datafiles/")
files = [os.path.join(datadir,x) for x in os.listdir(datadir) if x.endswith(".json")]


# In[13]:


positiveLocations = []
healthyLocations = []

for filename in files:
    with open(filename) as f: 
        data = json.load(f)
        
        locations = locproc.prepareLocations(data, settings)
        topNightLocations = locproc.getTopNightLocations(locations)
        uniqueLocations = locproc.getFilteredUniqueLocations(locations,topNightLocations).index.to_series()
        
        if 'positive' in data and data['positive'] == True:
            positiveLocations.append(uniqueLocations)
        else:
            healthyLocations.append(uniqueLocations)
            

mapPositiveClusters = pd.concat(positiveLocations).groupby(['latitude_output', 'longitude_output'])    .count()    .sort_values(ascending=False)
mapHealthyClusters = pd.concat(healthyLocations).groupby(['latitude_output', 'longitude_output'])    .count()    .sort_values(ascending=False)


# In[14]:


startpoint = (47,11)
map = folium.Map(startpoint, zoom_start=4, 
tiles='cartodbpositron')

map_data = [(index[0],index[1],value) for index, value in mapPositiveClusters.iteritems()]

heatmap = HeatMap([(index[0],index[1],value) for index, value in mapPositiveClusters.iteritems()],
                  name='Hotspots', 
                  max_val=len(files),
                  blur=2,
                  radius=5,
                  min_opacity=0.2,
                   max_zoom=5)
heatmap2 = HeatMap([(index[0],index[1],value) for index, value in mapHealthyClusters.iteritems()],
                  name='General Movement', 
                  max_val=len(files),
                  blur=2,
                  radius=5,
                  min_opacity=0.2,
                  max_zoom=5)
map.add_child(heatmap)
map.add_child(heatmap2)
folium.LayerControl().add_to(map)


# In[15]:


map.save("heatmap.html")

