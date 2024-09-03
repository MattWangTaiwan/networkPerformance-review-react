# networkPerformance-review-react
 
## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)

## Features

- **Three Different View:**
  - Default View : Review the performance of each metric within the network across different dates, and list the metric values for each individual unit.
  - Dashboard View : Use pre-designed charts to review network performance and provide a comparison between two date ranges to assess overall performance.
    - Top 10 unit
      - Quickly list the top 10 units with the best performance under the specified metric conditions.
    - Request vs. Impression vs. Revenue
      - Simultaneously list the changes in three metrics across different dates to explore their interrelationships.
    - eCPM vs. RPM
      - Compare the average eCPM and RPM across two date ranges to understand overall performance changes and quickly identify any units with outstanding performance.
  - List View : Summarize the performance of various metrics across the network and verify the changes in metric values. In addition to the overall network performance, also list the changes in each metric for every individual unit.
  - Report View : Present the data in a detailed and accurate list format, and provide a download option for users to download the data themselves.

|  | Default | Dashboard  | List  | Report  |
|:---------:|:---------:|:---------:|:---------:|:---------:|
| Date Range Selection | ✅ | ✅ | ✅ | ✅ |
| Date Range Compare |  | ✅ | ✅ |  |
| Currency Change | ✅ | ✅ | ✅ | ✅ |
| Matric switch | ✅ | ✅ |  |  |
| Matric summary |  |  | ✅ |  |
| Metric vs. datetime | ✅ | ✅ |  |  |
| Top 10 unit |  | ✅ |  |  
| Request vs. Impression vs. Revenue  |  | ✅ |  |  |
| eCPM vs. RPM |  | ✅ |  |  |
| Table | ✅ | | ✅ | ✅ |
| Sortable | ✅ | | ✅ | ✅ |
| Search Unit |  | | ✅ | ✅ |
| Download | | |  | ✅(xlsx) |

## Installation

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/MattWangTaiwan/networkPerformance-review-react.git
cd networkPerformance-review-react
# npm
npm install

# yarn
yarn install
```

## Usage

To start the development server:

```bash
# npm
npm run dev

#yarn
yarn dev

http://localhost:5173
```

## Technologies
- **react 18.3.1**
- **tailwindcss 3.4**
- **sql.js:** Used to temporarily store data and perform efficient searches to meet interface display requirements.
- **echarts:** Visualization library to create interactive charts.
- **react-table:** Headless UI for building powerful tables & datagrids.
