#!/usr/bin/env python
# coding: utf-8

# In[8]:


import pandas as pd
import json
import folium
from folium.plugins import HeatMap
import os
import locproc


# In[9]:


settings = {
    'coordinate_accuracy': 7,
    'coordinate_cluster_accuracy': 3,
    'coordinate_output_accuracy': 5
}
datadir = os.path.abspath("./datafiles/")
files = [os.path.join(datadir,x) for x in os.listdir(datadir) if x.endswith(".json")]


# In[10]:


positiveLocations = []
movementLocations = []

for filename in files:
    with open(filename) as f: 
        data = json.load(f)
        
        locations = locproc.prepareLocations(data, settings)
        topNightLocations = locproc.getTopNightLocations(locations)
        uniqueLocations = locproc.getFilteredUniqueLocations(locations,topNightLocations).index.to_series()
        
        if 'positive' in data and data['positive'] == True:
            positiveLocations.append(uniqueLocations)
        
        movementLocations.append(uniqueLocations)
            

mapPositiveClusters = pd.concat(positiveLocations).groupby(['latitude_output', 'longitude_output'])    .count()    .sort_values(ascending=False)
mapMovementClusters = pd.concat(movementLocations).groupby(['latitude_output', 'longitude_output'])    .count()    .sort_values(ascending=False)


# In[22]:


startpoint = (47,11)
map = folium.Map(startpoint, zoom_start=4, tiles='OpenStreetMap', control_scale = True)

positiveHeat = HeatMap([(index[0],index[1],value) for index, value in mapPositiveClusters.iteritems()],
                  name='COVID-19 Hotspots', 
                  max_val=len(files),
                  blur=2,
                  radius=5,
                  min_opacity=0.2,
                   max_zoom=18)
movementHeat = HeatMap([(index[0],index[1],value) for index, value in mapMovementClusters.iteritems()],
                  name='General Movement', 
                  max_val=len(files),
                  blur=2,
                  radius=5,
                  min_opacity=0.2,
                  max_zoom=18)
map.add_child(positiveHeat)
map.add_child(movementHeat)
folium.LayerControl(position='topright', collapsed=False).add_to(map)


# In[23]:


map.save("heatmap.html")

