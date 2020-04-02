#!/usr/bin/env python
# coding: utf-8

# In[80]:


import pandas as pd
import json
import folium
from folium.plugins import HeatMap
import os
import locproc


# In[81]:


personfiles = {
    'jakob': 'wolfi4_2020-03-24t15_55_10.999z.json',
    'wolfi': 'wolfi4_2020-03-25t19_29_26.969z.json',
    'steffi': 'wolfi4_2020-03-24t16_32_43.640z.json',
    'tiago': 'tiago9_2020-03-25t20_36_05.925z.json',
    'robert': 'wolfi4_2020-03-26t09_40_57.764z.json'
}


# In[82]:


settings = {
    'coordinate_accuracy': 7,
    'coordinate_cluster_accuracy': 3,
    'coordinate_output_accuracy': 5,
    'analyzeWindowDays': 30
}
datadir = os.path.abspath("./datafiles/")
files = [os.path.join(datadir,x) for x in os.listdir(datadir) if x.endswith(".json")]


# In[97]:


pd.Timestamp.today().strftime("%Y-%m-%d")


# In[83]:


positiveLocations = []
movementLocations = []

for filename in files:
    with open(filename) as f: 
        data = json.load(f)
        
    locations = locproc.prepareLocations(data, settings)
    locations = locations[                    locations.index.to_series().between(                            pd.Timestamp.today()-pd.to_timedelta(settings['analyzeWindowDays'], unit='d'),                            pd.Timestamp.today()                )]

    topNightLocations = locproc.getTopNightLocations(locations)
    uniqueLocations = locproc.getFilteredUniqueLocations(locations,topNightLocations).index.to_series()

    movementLocations.append(uniqueLocations)
    if 'positive' in data and data['positive'] == True:
        positiveLocations.append(uniqueLocations)
            
mapPositiveClusters = pd.concat(positiveLocations).groupby(['latitude_output', 'longitude_output'])    .count()    .sort_values(ascending=False)
mapMovementClusters = pd.concat(movementLocations).groupby(['latitude_output', 'longitude_output'])    .count()    .sort_values(ascending=False)


# In[101]:


startpoint = (47,11)
map = folium.Map(startpoint, zoom_start=4, tiles='OpenStreetMap', control_scale = True)

positiveHeat = HeatMap([(index[0],index[1],value) for index, value in mapPositiveClusters.iteritems()],
                  name='COVID-19 Hotspots'+pd.Timestamp.today().strftime(" (%Y-%m-%d)"), 
                  max_val=len([len(x) for x in positiveLocations if len(x) > 0]),
                  blur=2,
                  radius=5,
                  min_opacity=0.2,
                   max_zoom=18)
movementHeat = HeatMap([(index[0],index[1],value) for index, value in mapMovementClusters.iteritems()],
                  name='General Movement'+pd.Timestamp.today().strftime(" (%Y-%m-%d)"), 
                  max_val=len([len(x) for x in movementLocations if len(x) > 0]),
                  blur=2,
                  radius=5,
                  min_opacity=0.2,
                  max_zoom=18)
map.add_child(positiveHeat)
map.add_child(movementHeat)
folium.LayerControl(position='topright', collapsed=False).add_to(map)


# In[102]:


map

