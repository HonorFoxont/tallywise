import { ArcElement, CategoryScale, Chart as ChartJs, Legend, Title, Tooltip } from 'chart.js';
import { Pie } from 'react-chartjs-2';
ChartJs.register(CategoryScale, ArcElement, Title, Tooltip, Legend);

const PieChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };
  const dummydata = {
    labels: ['Studio', 'Glasshouse', 'Events'],
    datasets: [
      {
        label: 'Income form different categories',
        data: [20000, 10000, 80000],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        hoverOffset: 4,
      },
    ],
  };
  return <Pie options={options} data={dummydata} className="m-auto" />;
};

export default PieChart;
