#!/usr/bin/env python
# coding: utf-8

# In[4]:


import pandas as pd
import json
import folium
import geopandas
from folium.plugins import HeatMap
import os


# In[5]:


coordinate_accuracy = 7
coordinate_cluster_accuracy = 3
coordinate_output_accuracy = 5
datadir = os.path.abspath("./datafiles/")
files = {
    'jakob': 'wolfi4_2020-03-24t15_55_10.999z.json',
    'wolfi': 'wolfi4_2020-03-25t19_29_26.969z.json',
    'steffi': 'wolfi4_2020-03-24t16_32_43.640z.json',
    'tiago': 'tiago9_2020-03-25t20_36_05.925z.json'
}
files = [os.path.join(datadir,x) for x in os.listdir(datadir) if x.endswith(".json")]
files


# In[6]:


def prepareLocations(data):
    locations = pd.DataFrame.from_dict(data['locations']).filter(items=['timestampMs', 'latitudeE7', 'longitudeE7', 'accuracy'])
    locations = locations.set_index(pd.to_datetime(locations.timestampMs, unit='ms')) #TODO: Timezone!!!
    locations = locations.sort_index()
    locations['latitude'] = round(locations.latitudeE7 / 1e7, coordinate_accuracy)
    locations['longitude'] = round(locations.longitudeE7 / 1e7, coordinate_accuracy)
    locations['latitude_cluster'] = round(locations.latitudeE7 / 1e7, coordinate_cluster_accuracy)
    locations['longitude_cluster'] = round(locations.longitudeE7 / 1e7, coordinate_cluster_accuracy)
    locations['latitude_output'] = round(locations.latitude, coordinate_output_accuracy)
    locations['longitude_output'] = round(locations.longitude, coordinate_output_accuracy)

    # duration from one location to the next location
    locations['duration'] = locations['timestampMs'].astype(int).diff(periods=1)
    
    return locations


# In[7]:


def getTopNightLocations(locations):
    nightLocations = locations.between_time('23:00', '4:00')

    groupedNightLocations = nightLocations        .groupby(['latitude_cluster', 'longitude_cluster'])        .agg({'duration': ['sum','count']})        .sort_values(by=('duration','sum'),ascending=0)
    groupedNightLocations['minutes'] = groupedNightLocations[('duration','sum')]/60/1000
    topLocations = groupedNightLocations[groupedNightLocations['minutes'] > 180 ]
    return topLocations


# In[8]:


#startpoint = groupedNightLocations.index[0]
#map = folium.Map(startpoint, zoom_start=12, 
#tiles='cartodbpositron', width=640, height=480)

#[folium.CircleMarker((index[0],index[1]),
#    radius=1,
#    color='#0080bb',
#    fill_color='#0080bb').add_to(map) for index, row in topNightLocations.iterrows()]


# In[9]:


def getFilteredUniqueLocations(locations,locationsToRemove):
    filteredLocations = locations[-locations[['latitude_cluster', 'longitude_cluster']]                        .apply(tuple, axis=1).isin(locationsToRemove.index)]
    groupedFilteredLocations = filteredLocations        .groupby(['latitude_output', 'longitude_output'])        .agg({'duration': ['sum','count']})        .sort_values(by=('duration','sum'),ascending=0)
    return groupedFilteredLocations


# In[10]:


finalLocations = []
for filename in files:
    with open(filename) as f: 
        data = json.load(f)
        locations = prepareLocations(data)
        topNightLocations = getTopNightLocations(locations)
        finalLocations.append(getFilteredUniqueLocations(locations,topNightLocations).index.to_series())

mapClusters = pd.concat(finalLocations).groupby(['latitude_output', 'longitude_output']).count().sort_values(ascending=False)


# In[ ]:





# In[14]:


startpoint = (47,11)
map = folium.Map(startpoint, zoom_start=4, 
tiles='cartodbpositron')

map_data = [(index[0],index[1],value) for index, value in mapClusters.iteritems()]

heatmap = HeatMap(map_data,
                          max_val=len(files),
                          blur=2,
                          radius=5,
                          min_opacity=0.2,
                          max_zoom=5)

map.add_child(heatmap)


# In[12]:


map.save("heatmap.html")

