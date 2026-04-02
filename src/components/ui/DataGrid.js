import React from 'react';

const DataGrid = ({ headers, data }) => {
    if (!data || data.length === 0) return <div className="p-4 text-studio-text-dim text-center">No Data Available</div>;

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-studio-border">
                        {headers.map((header, i) => (
                            <th key={i} className="px-4 py-3 font-medium text-studio-text-muted text-xs uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-studio-border/50">
                    {data.map((row, i) => (
                        <tr key={i} className="hover:bg-studio-canvas transition-colors group">
                            {Object.values(row).map((cell, j) => (
                                <td key={j} className="px-4 py-3 text-studio-text-main font-mono text-xs whitespace-nowrap group-hover:text-studio-primary transition-colors">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataGrid;
