const { Stations } = require("../utils/stations.js");

class Station {
  static instance = null;
  static getInstance() {
    if (Station.instance === null) Station.instance = new Station();
    return Station.instance;
  }

  _stations = new Map();
  _mapped_stations = [];
  _categories = new Map();


  constructor() {
    let stations = Stations;
    stations.forEach((station) => {
      let mappedStation = {
        label: station.name,
        description: station.category,
        value: station.id
      }
      this._stations.set(station.id, station)
      if (this._categories.get(station.category)) {
        this._categories.get(station.category).push(mappedStation)
      } else {
        this._categories.set(station.category, [mappedStation])
      }

      this._mapped_stations.push(mappedStation)

    });

  }

  getStation(id) {
    return this._stations.get(id)
  }

  getStations() {
    return Stations;
  }

  getCategories() {
    return this._categories.keys();
  }

  getCategoryStations(category) {
    return this._categories.get(category);
  }

  getMappedStations() {
    return this._mapped_stations;
  }


};

module.exports = { Station }
