import {useEffect, useState} from 'react'
import useReportStore from '../../stores/useReportStore'

const RekapData = () => {
  const { fetchRecapByClass } = useReportStore();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRecapByClass();
        setReportData(data);
      } catch (err) {
        setError(err.message || "Failed to fetch report data");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [fetchRecapByClass]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  console.log(reportData);

  // Render report data
  return (
    <div>
        <h1>Rekap Data Siswa per Kelas</h1>
    </div>
  );
}

export default RekapData