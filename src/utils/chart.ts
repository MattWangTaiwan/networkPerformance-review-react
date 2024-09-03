export const lineChartOption = {
  grid: { top: 8, bottom: 24 },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [],
      type: 'line',
      markLine: {
        data: [{ type: 'average', name: 'Avg' }]
      }
    },
    {
      name: 'Compare',
      data: [],
      type: 'line',
      markLine: {
        data: [{ type: 'average', name: 'Avg' }]
      }
    }
  ],
  tooltip: {
    trigger: 'axis',
  },
};

const colors = ['#5470C6', '#91CC75', '#EE6666'];
export const barLineChartOption = {
  title: {
    text: 'Impression vs. Request vs. Revenue',
  },
  color: colors,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  grid: {
    right: '10%'
  },
  xAxis: [
    {
      type: 'category',
      data: []
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'Request/Impression',
      alignTicks: true,
      axisLine: {
        show: true,
      },
      axisLabel: {
        formatter: '{value}'
      }
    },
    {
      type: 'value',
      name: 'Revenue',
      alignTicks: true,
      axisLine: {
        show: true,
        lineStyle: {
          color: colors[2]
        }
      },
      axisLabel: {
        formatter: '{value}'
      }
    }
  ],
  series: [
    {
      name: 'Request',
      type: 'bar',
      data: []
    },
    {
      name: 'Impression',
      type: 'bar',
      data: []
    },
    {
      name: 'Revenue',
      type: 'line',
      yAxisIndex: 1,
      data: [],
      markLine: {
        data: [{ type: 'average', name: 'Avg' }]
      }
    }
  ]
};

export const scatterOption = {
  title: {
    text: 'eCPM vs. RPM',
  },
  grid: {
    left: '3%',
    right: '3%',
    containLabel: true
  },
  tooltip: {
    // trigger: 'axis',
    showDelay: 0,
    formatter: function (params) {
      return (
        'eCPM :' +
        params.value[0] +
        '<br/>RPM :' +
        params.value[1]
      );
    },
    axisPointer: {
      show: true,
      type: 'cross',
      lineStyle: {
        type: 'dashed',
        width: 1
      }
    }
  },
  brush: {},
  xAxis: [
    {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: '{value}'
      },
      splitLine: {
        show: false
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: '{value}'
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      name: 'eCPM',
      type: 'scatter',
      emphasis: {
        focus: 'series'
      },
      data: [],
      markArea: {
        silent: true,
        itemStyle: {
          color: 'transparent',
          borderWidth: 1,
          borderType: 'dashed'
        },
        data: [
          [
            {
              name: 'Analysis Data Range',
              xAxis: 'min',
              yAxis: 'min'
            },
            {
              xAxis: 'max',
              yAxis: 'max'
            }
          ]
        ]
      },
      markLine: {
        lineStyle: {
          type: 'solid'
        },
        data: [
          { type: 'average', name: 'AVG' },
          { type: 'average', name: 'Average', valueIndex: 0 }
        ]
      }
    },
    {
      name: 'RPM',
      type: 'scatter',
      emphasis: {
        focus: 'series'
      },
      data: [],
      markArea: {
        silent: true,
        itemStyle: {
          color: 'transparent',
          borderWidth: 1,
          borderType: 'dashed'
        },
        data: [
          [
            {
              name: 'Compare Data Range',
              xAxis: 'min',
              yAxis: 'min'
            },
            {
              xAxis: 'max',
              yAxis: 'max'
            }
          ]
        ]
      },
      markLine: {
        lineStyle: {
          type: 'solid'
        },
        data: [
          { type: 'average', name: 'Average' },
          { type: 'average', name: 'Average', valueIndex: 0 }
        ]
      }
    }
  ]
}