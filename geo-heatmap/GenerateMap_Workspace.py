#!/usr/bin/env python
# coding: utf-8

# In[66]:


import pandas as pd
import json
import folium
from folium.plugins import HeatMap
import os
import locproc


# In[67]:


personfiles = {
    'jakob': 'wolfi4_2020-03-24t15_55_10.999z.json',
    'wolfi': 'wolfi4_2020-03-25t19_29_26.969z.json',
    'steffi': 'wolfi4_2020-03-24t16_32_43.640z.json',
    'tiago': 'tiago9_2020-03-25t20_36_05.925z.json',
    'robert': 'wolfi4_2020-03-26t09_40_57.764z.json'
}


# In[68]:


settings = {
    'coordinate_accuracy': 7,
    'coordinate_cluster_accuracy': 3,
    'coordinate_output_accuracy': 5
}
datadir = os.path.abspath("./datafiles/")


# In[69]:



with open(os.path.join(datadir,personfiles['robert'])) as f: 
    data = json.load(f)

locations = locproc.prepareLocations(data, settings)
topNightLocations = locproc.getTopNightLocations(locations)
uniqueLocations = locproc.getFilteredUniqueLocations(locations,topNightLocations).index.to_series()

locations2 = locproc.prepareLocations(data, settings)

final2 = locations2    .groupby(['latitude', 'longitude'])    .agg({'duration': ['sum','count']})    .sort_values(by=('duration','count'),ascending=0)
#mapPositiveClusters = pd.concat(positiveLocations).groupby(['latitude_output', 'longitude_output'])\
#    .count()\
#    .sort_values(ascending=False)
#mapHealthyClusters = pd.concat(healthyLocations).groupby(['latitude_output', 'longitude_output'])\
#    .count()\
#    .sort_values(ascending=False)


# In[70]:


uniqueLocations


# In[71]:


startpoint = (47,11)
map = folium.Map(startpoint, zoom_start=4, 
tiles='cartodbpositron')

heatmap = HeatMap([(index[0],index[1],1) for index, value in uniqueLocations.iteritems()],
                  name='Ungenau', 
                  max_val=10,
                  blur=2,
                  radius=5,
                  min_opacity=0.2,
                   max_zoom=18)
heatmap2 = HeatMap([(index[0],index[1],value[('duration','sum')]) for index, value in final2.iterrows()],
                  name='Genau', 
                  max_val=max(final2[('duration','sum')]),
                  blur=2,
                  radius=5,
                  min_opacity=0.2,
                  max_zoom=18)
map.add_child(heatmap)
map.add_child(heatmap2)
folium.LayerControl().add_to(map)


# In[72]:


map.save("heatmap.html")

