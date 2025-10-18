// Export to Excel utility

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const handleExportToExcelRekapDataSiswa = (data, fileName) => {
    // Create a new workbook and a worksheet with custom header
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
        ["NIS", "Nama Siswa", "Kelas", "Total Pembayaran", "Status Pembayaran"],
        ...data.map((item) => [
            item.nis,
            item.name,
            item.class,
            item.paidAmount,
            item.status,
        ]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Data");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    // Create a Blob from the buffer
    const dataBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    // Save the file
    saveAs(dataBlob, `${fileName}.xlsx`);
};

export default handleExportToExcelRekapDataSiswa;