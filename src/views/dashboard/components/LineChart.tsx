import {
  CategoryScale,
  Chart as ChartJs,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJs.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const LineChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };
  const dummydata = {
    labels: ['jannuary', 'februery', 'may', 'june', 'july'],
    datasets: [
      {
        label: 'Income',
        data: [10000, 20000, 25000, 15000, 10000],
        borderColor: 'green',
      },
      {
        label: 'Savings',
        data: [3000, 5000, 6000, 4000, 8000],
        borderColor: 'blue',
      },
      {
        label: 'Expense',
        data: [5000, 8000, 7000, 8000, 9000],
        borderColor: 'red',
      },
    ],
  };
  return <Line options={options} data={dummydata} className="m-auto h-full w-full" />;
};

export default LineChart;
