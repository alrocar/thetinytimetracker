window.addEventListener('DOMContentLoaded', () => {
  var token = localStorage.getItem('token');
  if (!token) {
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
    }
  }

  function updateLastUpdate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString(); // Adjust the format as needed
    document.getElementById('last-update').textContent = `${formattedDate}`;
  }


  function getDashboardType() {
    return dashboardType;
  }

  var dashboardOptions = {
    "month": {
      "timeline": {
        chart: {
          height: 650,
          type: 'rangeBar'
        },
        plotOptions: {
          bar: {
            isDumbbell: true,
            horizontal: true
          }
        }
      },
    },
    "weekly": {
      "timeline": {
        chart: {
          height: 250,
          type: 'rangeBar'
        },
        plotOptions: {
          bar: {
            isDumbbell: true,
            horizontal: true
          }
        }
      }
    },
    "rt": {
      "timeline": {
        chart: {
          height: 100,
          type: 'rangeBar'
        },
        plotOptions: {
          bar: {
            isDumbbell: true,
            horizontal: true
          }
        }
      }
    }
  };

  var colors = ["#FFEE92", "#FF73DC", "#63FFE9", "#A4FFAF", "#FEFEFE", "#FFA07A", "#ADD8E6", "#90EE90", "#FFD700", "#DDA0DD"]
  //var colors = [];

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

  const spark1 = () => `https://api.tinybird.co/v0/pipes/sparks.json?token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const spark2 = () => `https://api.tinybird.co/v0/pipes/sparks.json?token=${token}&type=slack&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const spark3 = () => `https://api.tinybird.co/v0/pipes/sparks.json?token=${token}&type=coding&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const spark4 = () => `https://api.tinybird.co/v0/pipes/sparks.json?token=${token}&type=git&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const sparkrt2 = () => `https://api.tinybird.co/v0/pipes/sparks_rt.json?token=${token}&type=slack&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const sparkrt3 = () => `https://api.tinybird.co/v0/pipes/sparks_rt.json?token=${token}&type=coding&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const sparkrt4 = () => `https://api.tinybird.co/v0/pipes/sparks_rt.json?token=${token}&type=git&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const timeinapp = () => `https://api.tinybird.co/v0/pipes/active_app_by_day.json?limit=3&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const timeintab = () => `https://api.tinybird.co/v0/pipes/active_tab_by_day.json?limit=3&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const lineinapp = () => `https://api.tinybird.co/v0/pipes/active_app_by_day.json?limit=5&offset=3&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const lineintab = () => `https://api.tinybird.co/v0/pipes/active_tab_by_day.json?limit=5&offset=3&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const rtapp = () => `https://api.tinybird.co/v0/pipes/active_app.json?token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const rttab = () => `https://api.tinybird.co/v0/pipes/active_tab.json?token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const rtlineinapp = () => `https://api.tinybird.co/v0/pipes/active_app_by_day.json?limit=10&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}&duration=0`
  const rtlineintab = () => `https://api.tinybird.co/v0/pipes/active_tab_by_day.json?limit=10&token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}&duration=0`
  const timelineurl = () => `https://api.tinybird.co/v0/pipes/timeline_2.json?token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`
  const heatmapurl = () => `https://api.tinybird.co/v0/pipes/heatmap.json?token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}&heatmap=1`
  const treemapurl = () => `https://api.tinybird.co/v0/pipes/treemap_v2.json?token=${token}&dashboard=${getDashboardType()}&__tb__semver=${tbSemver}`

  async function fetchData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  function init() {
    const dashboardType = getDashboardType();
    if (window.intervalId) {
      clearInterval(window.intervalId);
    }
    if (dashboardType == 'rt') {
      updateLastUpdate()
      window.intervalId = window.setInterval(function () {
        init()
        updateLastUpdate()
      }, 10000);
    }
    const config = dashboards[dashboardType];
    config.charts.forEach(async (chart) => {
      try {
        let data = await fetchData(chart.url());
        data = data['data'];
        let title = chart.title;
        let chartConfig = Object.assign({}, dashboards.config[chart.chart], { series: [{ data }], id: chart.id, title: { text: chart.title } });
        if (chart.chart == 'spark' || chart.chart == 'sparkrt') {
          const sum = data[0]["data"].reduce((accumulator, currentValue) => accumulator + currentValue, 0);
          document.querySelector(`#${chart.title}-${getDashboardType()}`).textContent = `${getDashboardType() != 'rt' ? Math.round(sum) : Math.round(sum * 10000) / 10000} h.`;
          data = data[0]["data"];
          chartConfig = Object.assign({}, dashboards.config[chart.chart], { series: [{ data }], id: chart.id });
        } else if (chart.chart == 'barchart') {
          chartConfig = Object.assign({}, dashboards.config[chart.chart], { series: data, id: chart.id, title: { text: chart.title }, xaxis: { categories: data[0]["date"]} });
        } else if (chart.chart == 'linechart') {
          chartConfig = Object.assign({}, dashboards.config[chart.chart], { series: data, id: chart.id, title: { text: chart.title }, labels: data[0]["date"] });
        } else if (chart.chart == 'heatmap') {
          chartConfig = Object.assign({}, dashboards.config[chart.chart], { series: data, id: chart.id, title: { text: chart.title }});
        } else if (chart.chart == 'treemap') {
          const seriesData = data.sort((a, b) => b.y - a.y).filter(item => getDashboardType() == 'month' ? item.y > 1 : item.y > 0).map((item, i) => ({
            x: item.x,
            y: item.y,
            fillColor: item.x.indexOf('.') > -1 ? `${colors[2]}${(255 - i * 10).toString(16)}` : `${colors[3]}${(255 - i * 10).toString(16)}`,
          }));
          chartConfig = Object.assign({}, dashboards.config[chart.chart], { series: [{ data: seriesData }], id: chart.id, title: { text: chart.title } });
        } else if (chart.chart == 'hbarchart') {
          chartConfig = Object.assign({}, dashboards.config[chart.chart], { series: [{ data: data[0]["data"] }], id: chart.id, title: { text: chart.title }, xaxis: { categories: data[0]["categories"]} });
        } else if (chart.chart == 'timeline') {
          chartConfig = Object.assign({}, dashboards.config[chart.chart], { series: [{ data }], id: chart.id, title: { text: chart.title }, chart: dashboardOptions[getDashboardType()]["timeline"]["chart"], plotOptions: dashboardOptions[getDashboardType()]["timeline"]["plotOptions"] });
        }
        addChart(chart.id, chartConfig);
      } catch (error) {
        console.error(`Error fetching data for chart '${chart.title}':`, error);
      }
    });
  }

  document.getElementById('dot').addEventListener('click', () => {
    init()
  });
  const buttons = document.getElementsByClassName('toggle-button');
  Array.from(buttons).forEach((button) => {
    button.addEventListener('click', () => {
        dashboardType = button.id.split('-')[0];
        init();
        currentWrapper = document.getElementById(dashboardType);
        if (!currentWrapper.classList.contains('toggled')) {
          currentWrapper.classList.toggle('toggled');
        }
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
        localStorage.setItem('toggledButtonId', button.id);
    });
  });

  var tbSemver = '';
  var dashboardType = 'month';
  const toggledButtonId = localStorage.getItem('toggledButtonId');
  let button = undefined;
  if (toggledButtonId) {
    dashboardType = toggledButtonId.split('-')[0];
    button = document.getElementById(toggledButtonId);
    // document.querySelectorAll('.btn.toggled').forEach(e => {
    //   if (e && e.id.indexOf(dashboardType) < 0) {
    //     e.click();
    //   }
    // });
  }

  var dashboards = {
    config: {
      spark: {
        chart: {
          group: 'sparks',
          type: 'area',
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
        colors: colors,
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
      },
      sparkrt: {
        chart: {
          group: 'sparks',
          type: 'bar',
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
        colors: colors,
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
      },
      timeline: {
        colors: colors,
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
          align: 'left',
          offsetY: 5,
          offsetX: 20
        },
        tooltip: {
          custom: function(opts) {
            return opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].x;
          }
        }
      },
      hbarchart: {
        chart: {
          type: 'bar',
          height: 650
        },
        colors: colors[1],
        fill: {
          opacity: 1
        },
        plotOptions: {
          bar: {
            borderRadius: 0,
            horizontal: true,
            barHeight: '50%',
          }
        },
        dataLabels: {
          enabled: true,
          orientation: 'horizontal',
          postition: 'top',
          total: {
            enabled: true
          }
        },
        title: {
          align: 'right',
          offsetY: 13,
          offsetX: 0
        },
      },
      barchart: {
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
        colors: colors,
        fill: {
          opacity: 1
        },
        title: {
          align: 'right',
          offsetY: 13,
          offsetX: 0
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          offsetY: 0
        }
      },
      linechart: {
        chart: {
          height: 328,
          // type: 'line',
          type: 'area',
          stacked: false,
          zoom: {
            enabled: true
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
        title: {
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
      },
      heatmap: {
        chart: {
          height: 450,
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
      },
      treemap: {
        chart: {
          height: 450,
          type: 'treemap'
        },
        title: {
          align: 'right',
          offsetY: 13,
          offsetX: 0
        },
        legend: {
          show: true,
          position: 'top',
          horizontalAlign: 'left',
          offsetY: 0
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '60px',
          },
          formatter: function(text, op) {
            return [text, op.value]
          },
          offsetY: -4
        },
        stroke: {
          width: 3,
        },
        plotOptions: {
          treemap: {
            distributed: true,
          }
        }
      },
    },
    month: {
      charts: [{
        url: spark1,
        id: `spark1-month`,
        title: 'worked',
        chart: 'spark'
      }, {
        url: spark2,
        id: `spark2-month`,
        title: 'slack',
        chart: 'spark'
      }, {
        url: spark3,
        id: `spark3-month`,
        title: 'coding',
        chart: 'spark'
      }, {
        url: spark4,
        id: `spark4-month`,
        title: 'git',
        chart: 'spark'
      }, {
        url: timelineurl,
        id: `timeline-month`,
        title: 'Work hours timeline',
        chart: 'timeline'
      }, {
        url: timeinapp,
        id: `barchart-month`,
        title: 'Time in app (top 3)',
        chart: 'barchart'
      }, {
        url: timeintab,
        id: `barchart-tab-month`,
        title: 'Time in browser tab (top 3)',
        chart: 'barchart'
      }, {
        url: lineinapp,
        id: `timeinapp-month`,
        title: 'Time in app (others)',
        chart: 'linechart'
      }, {
        url: lineintab,
        id: `timeinbrowser-month`,
        title: 'Time in browser tab (others)',
        chart: 'linechart'
      }, {
        url: heatmapurl,
        id: `heatmap-month`,
        title: 'Work hours distribution',
        chart: 'heatmap'
      }, {
        url: treemapurl,
        id: `treemap-month`,
        title: 'App hours distribution',
        chart: 'treemap'
      }]
    },
    weekly: {
      charts: [{
        url: spark1,
        id: `spark1-weekly`,
        title: 'worked',
        chart: 'spark'
      }, {
        url: spark2,
        id: `spark2-weekly`,
        title: 'slack',
        chart: 'spark'
      }, {
        url: spark3,
        id: `spark3-weekly`,
        title: 'coding',
        chart: 'spark'
      }, {
        url: spark4,
        id: `spark4-weekly`,
        title: 'git',
        chart: 'spark'
      }, {
        url: timelineurl,
        id: `timeline-weekly`,
        title: 'Work hours timeline',
        chart: 'timeline'
      }, {
        url: timeinapp,
        id: `barchart-weekly`,
        title: 'Time in app (top 3)',
        chart: 'barchart'
      }, {
        url: timeintab,
        id: `barchart-tab-weekly`,
        title: 'Time in browser tab (top 3)',
        chart: 'barchart'
      }, {
        url: lineinapp,
        id: `timeinapp-weekly`,
        title: 'Time in app (others)',
        chart: 'linechart'
      }, {
        url: lineintab,
        id: `timeinbrowser-weekly`,
        title: 'Time in browser tab (others)',
        chart: 'linechart'
      }, {
        url: heatmapurl,
        id: `heatmap-weekly`,
        title: 'Work hours distribution',
        chart: 'heatmap'
      }, {
        url: treemapurl,
        id: `treemap-weekly`,
        title: 'App hours distribution',
        chart: 'treemap'
      }]
    },
    rt: {
      charts: [{
        url: spark1,
        id: `spark1-rt`,
        title: 'worked',
        chart: 'spark'
      }, {
        url: sparkrt2,
        id: `spark2-rt`,
        title: 'slack',
        chart: 'sparkrt'
      }, {
        url: sparkrt3,
        id: `spark3-rt`,
        title: 'coding',
        chart: 'sparkrt'
      }, {
        url: sparkrt4,
        id: `spark4-rt`,
        title: 'git',
        chart: 'sparkrt'
      }, {
        url: rtapp,
        id: `timeinapp-rt`,
        title: 'Time in app',
        chart: 'hbarchart'
      }, {
        url: rttab,
        id: `timeinbrowser-rt`,
        title: 'Time in browser tab',
        chart: 'hbarchart'
      }, {
        url: treemapurl,
        id: `treemap-rt`,
        title: 'App hours distribution',
        chart: 'treemap'
      }, {
        url: timelineurl,
        id: `timeline-rt`,
        chart: 'timeline'
      }, {
        url: rtlineinapp,
        id: `timeinappline-rt`,
        title: 'Time in app',
        chart: 'linechart'
      }, {
        url: rtlineintab,
        id: `timeinbrowserline-rt`,
        title: 'Time in browser tab',
        chart: 'linechart'
      }, ]
    }
  }

  if (button) {
    button.click()
  } else {
    init()
  }

  // real-time -> include pulse / next update 10s
  // work hours / slack / coding / git
  // active app / active tab
  // working hours timeline today
  // horizontal barchart (limit 10):
  //   - time in app today
  //   - time in browser today
});
