# networkPerformance-review-react
 
## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)

## Features

- **Three Different View:**
  - Default View : Quickly view the performance of each metric by date.
  - Dashboard View : Interactively compare different metrics to gain insights.
  - List View : 
  - Report View : Deeply compare the content of each data entry.

|  | Default | Dashboard  | List  | Report  |
|:---------:|:---------:|:---------:|:---------:|:---------:|
| Date Range Selection | ✅ | ✅ | ✅ |  |
| Currency Change | ✅ | ✅ | ✅ |  |
| Matric switch | ✅ | ✅ |  |  |
| Metric vs. datetime | ✅ | ✅ |  |  |
| eCPM top 10 |  | ✅ |  |  |
| RPM top 10 |  | ✅ |  |  |
| RPM top 10 |  | ✅ |  |  |
| Impression vs. request |  | ✅ |  |  |
| Table | ✅ | | ✅ |  |
| Sortable | ✅ | | ✅ |  |
| Avg. Compare | | | ✅ |  |
| Download | | | ✅(xlsx) |  |

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
