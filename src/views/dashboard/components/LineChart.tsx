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
import { type ChartOptions } from 'chart.js'; // Import ChartOptions for typing
import { Line } from 'react-chartjs-2';

ChartJs.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const LineChart = () => {
  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const, // Explicitly type as a valid position
      },
      title: {
        display: true,
        text: 'Transaction Trends by Type',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (NPR)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  const dummydata = {
    labels: ['January', 'February', 'May', 'June', 'July'], // Fixed typos in labels
    datasets: [
      {
        label: 'Income',
        data: [10000, 20000, 25000, 15000, 10000],
        borderColor: 'green',
        backgroundColor: 'rgba(0, 128, 0, 0.1)',
        fill: true,
      },
      {
        label: 'Savings',
        data: [3000, 5000, 6000, 4000, 8000],
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        fill: true,
      },
      {
        label: 'Expense',
        data: [5000, 8000, 7000, 8000, 9000],
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        fill: true,
      },
    ],
  };

  return <Line options={options} data={dummydata} className="m-auto h-full w-full" />;
};

export default LineChart;
