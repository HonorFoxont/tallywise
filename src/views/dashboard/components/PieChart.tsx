import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { type FC } from 'react';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: { name: string; value: number; fill: string }[];
}

const PieChart: FC<PieChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.fill),
        borderColor: data.map((item) => item.fill),
        borderWidth: 1,
      },
    ],
  };

  return (
    <Pie
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: false },
        },
      }}
    />
  );
};

export default PieChart;
