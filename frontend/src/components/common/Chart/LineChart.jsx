import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, xKey, yKey, title }) => {
  return (
    <div>
      {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={yKey} stroke="#3b82f6" strokeWidth={2} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;