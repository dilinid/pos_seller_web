import { DISTRICTS } from '../../data/districts';

interface DistrictFeeTableProps {
  districtFees: Record<string, number>;
  onChange: (fees: Record<string, number>) => void;
  disabled?: boolean;
}

export const DistrictFeeTable: React.FC<DistrictFeeTableProps> = ({ districtFees, onChange, disabled }) => {
  const setFee = (districtId: string, value: string) => {
    const parsed = parseFloat(value);
    onChange({ ...districtFees, [districtId]: isNaN(parsed) ? 0 : parsed });
  };

  return (
    <div className="prod-district-table">
      <div className="prod-district-header">
        <span>District</span>
        <span>Delivery Fee ($)</span>
      </div>
      {DISTRICTS.map((d) => (
        <div key={d.id} className="prod-district-row">
          <span className="prod-district-name">{d.name}</span>
          {disabled ? (
            <span className="prod-district-fee">
              {districtFees[d.id] != null && districtFees[d.id] > 0
                ? `$${districtFees[d.id].toFixed(2)}`
                : '—'}
            </span>
          ) : (
            <input
              type="number"
              step="0.01"
              min="0"
              value={districtFees[d.id] ?? ''}
              onChange={(e) => setFee(d.id, e.target.value)}
              placeholder="0.00"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100px', textAlign: 'right' }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
