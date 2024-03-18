var token = localStorage.getItem('token');
var dashboardType = 'monthly';
var tbSemver = '';

var dashboardOptions = {
  "monthly": {
    "timeline": {
      chart: {
        height: 650,
        type: 'rangeBar'
      },
    },
  },
  "weekly": {
    "timeline": {
      chart: {
        height: 250,
        type: 'rangeBar'
      },
    }
  },
  "rt": {
    linechart: {
      chart: {
        height: 250,
        type: 'rangeBar'
      },
    }
  }
};

function getDashboardType() {
  return dashboardType;
}

if (!token) {
  const urlParams = new URLSearchParams(window.location.search);
  token = urlParams.get('token');

  if (token) {
    localStorage.setItem('token', token);
  }
}



var colors = ["#FFEE92", "#FF73DC", "#63FFE9", "#A4FFAF", "#FEFEFE"]
//var colors = ["#FFA07A", "#ADD8E6", "#90EE90", "#FFD700", "#DDA0DD"];

//var colors = ["#003f5c","#2f4b7c","#665191","#a05195","#d45087","#f95d6a","#ff7c43","#ffa600"].reverse()
window.charts = {};
window.Apex = {
  chart: {
    foreColor: '#ccc',
    toolbar: {
      show: false
    },
  },
  stroke: {
    width: 3
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    theme: 'dark'
  },
  grid: {
    borderColor: "#535A6C",
    xaxis: {
      lines: {
        show: true
      }
    }
  }
};

function addChart(id, options) {
  if (! window.charts[id]) {
    var chart = new ApexCharts(document.querySelector(`#${id}`), options);
    chart.render();
    window.charts[id] = chart;
  } else {
    window.charts[id].updateSeries(options["series"])
    window.charts[id].updateOptions(options)
  }
}

function spark(url, id, title) {
  fetch(url)
  .then(response => response.json())
  .then(data => {
    var spark = {
      chart: {
        id: id,
        group: 'sparks',
        type: 'line',
        height: 80,
        sparkline: {
          enabled: true
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          opacity: 0.2,
        }
      },
      series: [{
        data: data["data"][0]["data"]
      }],
      stroke: {
        curve: 'smooth'
      },
      markers: {
        size: 0
      },
      grid: {
        padding: {
          top: 20,
          bottom: 10,
          left: 110
        }
      },
      colors: ['#fff'],
      tooltip: {
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function formatter(val) {
              return '';
            }
          }
        }
      }
    }

    addChart(id, spark)
    const sum = data["data"][0]["data"].reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    document.querySelector(`#${title}`).textContent = Math.round(sum)
  })
  .catch(error => console.error(`Error fetching ${id} data:`, error));
}

function timeline(url) {
  fetch(url)
  .then(response => response.json())
  .then(data => {
    var options = {
      series: [
        {
          data: data['data']
        }
      ],
      // colors: ["#f95d6a"],
      colors: colors,
      chart: dashboardOptions[getDashboardType()]["timeline"]["chart"],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '50%'
        }
      },
      xaxis: {
        type: 'datetime'
      },
      stroke: {
        width: 1
      },
      fill: {
        type: 'solid',
        opacity: 0.5
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left'
      },
      title: {
        text: 'Work hours timeline',
        align: 'left',
        offsetY: 5,
        offsetX: 20
      },
    };

    addChart('timeline', options)
  })
  .catch(error => console.error('Error fetching timeline data:', error));
}

function barchart(url, id, title) {
  fetch(url)
  .then(response => response.json())
  .then(data => {
    var optionsBar = {
      chart: {
        height: 380,
        type: 'bar',
        stacked: true
      },
      plotOptions: {
        bar: {
          columnWidth: '30%',
          horizontal: false,
        },
      },
      //colors: ["#003f5c","#2f4b7c","#665191","#a05195","#d45087","#f95d6a","#ff7c43","#ffa600"].reverse(),
      colors: colors,
      series: data["data"],
      xaxis: {
        categories: data["data"][0]["date"],
      },
      fill: {
        opacity: 1
      },
      title: {
        text: title,
        align: 'right',
        offsetY: 13,
        offsetX: 0
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetY: 0
      }
    }
    addChart(id, optionsBar)
  })
  .catch(error => console.error('Error fetching barchart data:', error));

}

function linechart(url, id, title) {
  fetch(url)
  .then(response => response.json())
  .then(data => {
    var optionsLine = {
      chart: {
        height: 328,
        // type: 'line',
        type: 'area',
        stacked: false,
        zoom: {
          enabled: false
        },
        dropShadow: {
          enabled: false,
          top: 3,
          left: 2,
          blur: 4,
          opacity: 1,
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      fill: {
        type: 'solid',
        colors: colors,
        opacity: 0
        // gradient: {
        //   shade: 'dark',
        //   inverseColors: true,
        //   shadeIntensity: 1,
        //   opacityFrom: 0.1,
        //   opacityTo: 0.9,
        //   stops: [0, 90, 100]
        // }
      },
      //colors: ["#003f5c","#2f4b7c","#665191","#a05195","#d45087","#f95d6a","#ff7c43","#ffa600"].reverse(),
      colors: colors,
      series: data["data"],
      title: {
        text: title,
        align: 'right',
        offsetY: 13,
        offsetX: 0
      },
      // subtitle: {
      //   text: 'Statistics',
      //   offsetY: 55,
      //   offsetX: 20
      // },
      markers: {
        size: 2,
        strokeWidth: 0,
        hover: {
          size: 4
        }
      },
      grid: {
        show: true,
        padding: {
          bottom: 0
        }
      },
      labels: data["data"][0]["date"],
      xaxis: {
        tooltip: {
          enabled: false
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetY: 0
      }
    }

    addChart(id, optionsLine)
  })
  .catch(error => console.error('Error fetching linechart data:', error));
}

function heatmap(url, id, title) {
  fetch(url)
  .then(response => response.json())
  .then(data => {
    var options = {
      series: data['data'],
      chart: {
        height: 250,
        type: 'heatmap',
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#FFEE92'],
      xaxis: {
        type: 'category',
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      },
      title: {
        text: title,
        align: 'right',
        offsetY: 13,
        offsetX: 0
      },
      grid: {
        padding: {
          right: 20
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetY: 0
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 1,
          radius: 0,
          useFillColorAsStroke: false,
          colorScale: {
            ranges: [{
                from: 0,
                to: 7,
                name: 'low',
                color: colors[2]
              },
              {
                from: 7,
                to: 9,
                name: 'standard',
                color: colors[3]
              },
              {
                from: 9,
                to: 10,
                name: 'extended',
                color: colors[0]
              },
              {
                from: 11,
                to: 24,
                name: '🚨',
                color: colors[1]
              }
            ]
          }
        }
      },
    };
    addChart(id, options)
  })
  .catch(error => console.error('Error fetching heatmap data:', error));
}

const spark1 = () => `https://api.tinybird.co/v0/pipes/sparks.json?token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
const spark2 = () => `https://api.tinybird.co/v0/pipes/sparks.json?token=${token}&type=slack&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
const spark3 = () => `https://api.tinybird.co/v0/pipes/sparks.json?token=${token}&type=coding&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
const spark4 = () => `https://api.tinybird.co/v0/pipes/sparks.json?token=${token}&type=git&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
const timeinapp = () => `https://api.tinybird.co/v0/pipes/active_app_by_day.json?limit=3&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
const timeintab = () => `https://api.tinybird.co/v0/pipes/active_tab_by_day.json?limit=3&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
const lineinapp = () => `https://api.tinybird.co/v0/pipes/active_app_by_day.json?limit=5&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
const lineintab = () => `https://api.tinybird.co/v0/pipes/active_tab_by_day.json?limit=5&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
const timelineurl = () => `https://api.tinybird.co/v0/pipes/timeline_2.json?token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
const heatmapurl = () => `https://api.tinybird.co/v0/pipes/heatmap.json?token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`

function init() {
  spark(spark1(), 'spark1', 'worked')
  spark(spark2(), 'spark2', 'slack')
  spark(spark3(), 'spark3', 'coding')
  spark(spark4(), 'spark4', 'git')

  heatmap(heatmapurl(), 'heatmap', 'Work hours distribution')
  timeline(timelineurl())

  barchart(timeinapp(), 'barchart', 'Time in app')
  barchart(timeintab(), 'barchart-tab', 'Time in browser tab')

  linechart(lineinapp(), 'line-adwords', 'Time in app')
  linechart(lineintab(), 'line-adwords-tab', 'Time in browser tab')
}

init()
// window.setInterval(function () {
//   init()
// }, 10000)

const buttons = document.getElementsByClassName('toggle-button');
Array.from(buttons).forEach((button) => {
  button.addEventListener('click', () => {
      dashboardType = button.id.split('-')[0];
      init();
      currentWrapper = document.getElementById(dashboardType);
      currentWrapper.classList.toggle('toggled');
      const wrappers = document.getElementsByClassName('wrapper');
      Array.from(wrappers).forEach((w) => {
        if (w.classList.contains('toggled') && w != currentWrapper) {
          w.classList.toggle('toggled')
        }
      });

      if (button.classList.contains('toggled')) {
        return;
      }
      const others = document.getElementsByClassName('toggle-button');
      Array.from(others).forEach((b) => {
        if (b.classList.contains('toggled') && b != button) {
          b.classList.toggle('toggled')
        }
      });
      button.classList.toggle('toggled')
  });
});



// real-time -> include pulse / next update 10s
// work hours / slack / coding / git
// active app / active tab
// working hours timeline today
// horizontal barchart (limit 10):
//   - time in app today
//   - time in browser today