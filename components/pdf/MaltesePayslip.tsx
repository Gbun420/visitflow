import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a standard font
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' }
  ]
});

export interface PayslipData {
  company: {
    name: string;
    address: string;
    registrationNumber?: string;
  };
  employee: {
    name: string;
    id: string;
    designation: string;
    taxId?: string;
    niNumber?: string;
  };
  period: {
    startDate: string;
    endDate: string;
    payDate: string;
  };
  hours: {
    normal: number;
    overtime: number;
  };
  leave: {
    used: number;
    balance: number;
  };
  financials: {
    basicWage: number;
    bonuses: number;
    taxDeduction: number;
    niDeduction: number;
    sscEmployer: number;
    netPay: number;
    totalGross: number;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    textDecoration: 'underline',
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  col: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
  },
  table: {
    marginTop: 10,
    borderTop: 1,
    borderLeft: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    minHeight: 20,
    alignItems: 'center',
  },
  tableColHeader: {
    flex: 1,
    borderRight: 1,
    backgroundColor: '#f0f0f0',
    padding: 4,
    fontWeight: 'bold',
  },
  tableCol: {
    flex: 1,
    borderRight: 1,
    padding: 4,
  },
  textRight: {
    textAlign: 'right',
  },
  footer: {
    marginTop: 30,
    borderTop: 2,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  netPayBlock: {
    width: 200,
    backgroundColor: '#f9f9f9',
    padding: 10,
    border: 1,
  },
  netPayText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  }
});

const MaltesePayslip = ({ data }: { data: PayslipData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Company Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>{data.company.name}</Text>
        <Text>{data.company.address}</Text>
        {data.company.registrationNumber && <Text>Reg No: {data.company.registrationNumber}</Text>}
      </View>

      <Text style={styles.title}>ITEMISED PAYSLIP</Text>

      {/* Employee & Period Details */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.col}>
            <View style={styles.row}><Text style={styles.label}>Employee:</Text><Text>{data.employee.name}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Designation:</Text><Text>{data.employee.designation}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Employee ID:</Text><Text>{data.employee.id}</Text></View>
          </View>
          <View style={styles.col}>
            <View style={styles.row}><Text style={styles.label}>Pay Period:</Text><Text>{data.period.startDate} - {data.period.endDate}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Pay Date:</Text><Text>{data.period.payDate}</Text></View>
            {data.employee.taxId && <View style={styles.row}><Text style={styles.label}>Tax ID:</Text><Text>{data.employee.taxId}</Text></View>}
          </View>
        </View>
      </View>

      {/* Hours & Leave (Legal Requirement) */}
      <View style={styles.section}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Attendance & Leave</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Normal Hours</Text>
            <Text style={styles.tableColHeader}>Overtime Hours</Text>
            <Text style={styles.tableColHeader}>Leave Used</Text>
            <Text style={styles.tableColHeader}>Leave Balance</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>{data.hours.normal}</Text>
            <Text style={styles.tableCol}>{data.hours.overtime}</Text>
            <Text style={styles.tableCol}>{data.leave.used}</Text>
            <Text style={styles.tableCol}>{data.leave.balance}</Text>
          </View>
        </View>
      </View>

      {/* Earnings & Deductions */}
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {/* Earnings */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Earnings</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>Description</Text>
                <Text style={[styles.tableColHeader, styles.textRight]}>Amount (€)</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol}>Basic Wage</Text>
                <Text style={[styles.tableCol, styles.textRight]}>{data.financials.basicWage.toFixed(2)}</Text>
              </View>
              {data.financials.bonuses > 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.tableCol}>Allowances/Bonuses</Text>
                  <Text style={[styles.tableCol, styles.textRight]}>{data.financials.bonuses.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>Total Gross</Text>
                <Text style={[styles.tableCol, styles.textRight, { fontWeight: 'bold' }]}>{data.financials.totalGross.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Deductions */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Deductions</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>Description</Text>
                <Text style={[styles.tableColHeader, styles.textRight]}>Amount (€)</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol}>FSS Tax</Text>
                <Text style={[styles.tableCol, styles.textRight]}>{data.financials.taxDeduction.toFixed(2)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol}>National Insurance (SSC)</Text>
                <Text style={[styles.tableCol, styles.textRight]}>{data.financials.niDeduction.toFixed(2)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>Total Deductions</Text>
                <Text style={[styles.tableCol, styles.textRight, { fontWeight: 'bold' }]}>{(data.financials.taxDeduction + data.financials.niDeduction).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Net Pay Footer */}
      <View style={styles.footer}>
        <View style={styles.netPayBlock}>
          <Text style={{ fontSize: 8, color: '#666', marginBottom: 2 }}>NET PAYABLE</Text>
          <Text style={styles.netPayText}>€ {data.financials.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
      </View>

      <View style={{ marginTop: 40, fontSize: 8, color: '#999' }}>
        <Text>This is a computer generated document. No signature is required.</Text>
        <Text>Compliance: Malta Legal Notice 274 of 2018.</Text>
      </View>
    </Page>
  </Document>
);

export default MaltesePayslip;
