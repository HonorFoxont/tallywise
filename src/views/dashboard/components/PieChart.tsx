import { ArcElement, Chart as ChartJs, Legend, Title, Tooltip } from 'chart.js';
import { type ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJs.register(ArcElement, Title, Tooltip, Legend);

const PieChart = () => {
  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const, // Explicitly type as valid position
      },
      title: {
        display: true,
        text: 'Transactions by Category',
        color: '#1F2937',
      },
    },
  };

  const dummydata = {
    labels: ['Studio', 'Events', 'Glasshouse'],
    datasets: [
      {
        label: 'Transaction Amount by Category',
        data: [15000, 8000, 3000],
        backgroundColor: [
          'rgba(16, 185, 129, 0.5)', // #10B981 (green)
          'rgba(245, 158, 11, 0.5)', // #F59E0B (orange)
          'rgba(239, 68, 68, 0.5)', // #EF4444 (red)
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  return <Pie options={options} data={dummydata} className="m-auto" />;
};

export default PieChart;
