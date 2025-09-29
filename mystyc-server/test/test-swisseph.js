const swisseph = require('swisseph');

swisseph.swe_set_ephe_path(__dirname + '/node_modules/swisseph/ephe');

const year = 2025, month = 8, day = 4, hour = 12.0;

swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (julday) => {
  swisseph.swe_calc_ut(julday, swisseph.SE_SUN, 0, (result) => {
    console.log('Sun position:', result);
  });
});
