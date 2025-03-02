import { useEffect, useState, useRef } from "react";
import Layout from "../../../components/layout/layout";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
// import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
// import { confirmPopup } from "primereact/confirmpopup";
import { ConfirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import {
  createReport,
  getAllReports,
  getReportById,
  downloadReportFile,
  deleteReport,
} from "../../../services/transactions/reports";
import { getAllUsers } from "../../../services/settings/users";
import { getAllAccounts } from "../../../services/transactions/accounts";
import { useAuth } from "../../../states/use-auth";
import "../../styles/transactions/accounts.css";

const Reports = () => {
  const toast = useRef(null);
  const [reportsData, setReportsData] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [visible, setVisible] = useState(false);
  const [newReport, setNewReport] = useState({
    printed_by: "", // Changed from print_by to printed_by
    file_type: "",
    report_type: "",
    account_type: "",
    filter_by: "",
    filter_month: "",
    filter_day: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialReportData, setInitialReportData] = useState(null);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedReports = await getAllReports();
        const fetchedUsers = await getAllUsers();
        const fetchedAccounts = await getAllAccounts();
        setReportsData(fetchedReports);
        setFilteredReports(fetchedReports);
        setUsers(fetchedUsers);
        setAccounts(fetchedAccounts);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = reportsData.filter(
      (report) =>
        report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.file_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filteredData);
  }, [searchTerm, reportsData]);

  // Improved validateInputs function - check required fields
  const validateInputs = (report) => {
    let isValid = true;
    const newErrors = {};

    // Only validate required fields
    if (!report.printed_by) {
      // Changed from print_by to printed_by
      newErrors.printed_by = "Print By is required";
      isValid = false;
    }

    if (!report.file_type) {
      newErrors.file_type = "File Type is required";
      isValid = false;
    }

    if (!report.report_type) {
      newErrors.report_type = "Report Type is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateReport = async () => {
    if (!validateInputs(newReport)) {
      return;
    }

    try {
      // Log the report data being sent to the API
      console.log("Sending report data:", newReport);

      const createdReport = await createReport(newReport);
      setReportsData((prevReports) => [...prevReports, createdReport]);
      setVisible(false);
      setNewReport({
        printed_by: "", // Changed from print_by to printed_by
        file_type: "",
        report_type: "",
        account_type: "",
        filter_by: "",
        filter_month: "",
        filter_day: "",
      });
      setErrors({});
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Report created successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error creating report:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to create report",
        life: 3000,
      });
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      await deleteReport(id);
      setReportsData((prevReports) =>
        prevReports.filter((report) => report.id !== id)
      );
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Report deleted successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete report",
        life: 3000,
      });
    }
  };

  const handleDownloadReport = async (id) => {
    try {
      const { success, fileName } = await downloadReportFile(id);
      if (success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `Report ${fileName} downloaded successfully`,
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to download report",
        life: 3000,
      });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions">
        <Button
          icon="pi pi-download"
          className="p-button-rounded p-button-success"
          onClick={() => handleDownloadReport(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-danger"
          onClick={() => handleDeleteReport(rowData.id)}
        />
      </div>
    );
  };

  // Reset form function
  const resetForm = () => {
    setVisible(false);
    setSelectedReport(null);
    setIsEditMode(false);
    setNewReport({
      printed_by: "", // Changed from print_by to printed_by
      file_type: "",
      report_type: "",
      account_type: "",
      filter_by: "",
      filter_month: "",
      filter_day: "",
    });
    setErrors({});
  };

  return (
    <Layout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <Card className="roles-container">
        <h2 className="roles-title">Reports</h2>
        <div className="roles-card">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Type or File Type..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="create-button"
              onClick={() => {
                setVisible(true);
                setSelectedReport(null);
                setIsEditMode(false);
                setErrors({});
              }}
            >
              Create
            </button>
          </div>
        </div>

        <DataTable
          value={filteredReports}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 30]}
          tableStyle={{ width: "100%" }}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
        >
          <Column field="id" header="ID" style={{ width: "7%" }} sortable />
          <Column
            field="printed_by_user" // Keeping this unchanged as it's display only
            header="Print By"
            style={{ width: "23%" }}
            sortable
          />
          <Column
            field="file_type"
            header="File Type"
            style={{ width: "15%" }}
            sortable
          />
          <Column
            field="report_type"
            header="Report Type"
            style={{ width: "15%" }}
            sortable
          />
          <Column
            field="print_date"
            header="Print Date"
            style={{ width: "25%" }}
            sortable
          />
          <Column
            body={actionBodyTemplate}
            header="Actions"
            style={{ width: "15%" }}
          />
        </DataTable>
      </Card>

      <Dialog
        header={selectedReport ? "Report Details" : "Create New Report"}
        visible={visible}
        onHide={resetForm}
        className="custom-dialog"
      >
        <div className="p-fluid">
          {/* Required Fields */}
          <div className="p-field custom-field">
            <label htmlFor="printed_by">
              Print By <span className="required-field">*</span>
            </label>
            <Dropdown
              id="printed_by"
              value={
                selectedReport
                  ? selectedReport.printed_by
                  : newReport.printed_by
              }
              options={users.map((user) => ({
                label: user.full_name,
                value: user.id,
              }))}
              onChange={(e) =>
                selectedReport
                  ? setSelectedReport({
                      ...selectedReport,
                      printed_by: e.value,
                    })
                  : setNewReport({ ...newReport, printed_by: e.value })
              }
              placeholder="Select User"
              className={`custom-input ${errors.printed_by ? "p-invalid" : ""}`}
            />
            {errors.printed_by && (
              <small className="p-error">{errors.printed_by}</small>
            )}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="file_type">
              File Type <span className="required-field">*</span>
            </label>
            <Dropdown
              id="file_type"
              value={
                selectedReport ? selectedReport.file_type : newReport.file_type
              }
              options={[
                { label: "PDF", value: "pdf" },
                { label: "Excel", value: "excel" },
              ]}
              onChange={(e) =>
                selectedReport
                  ? setSelectedReport({ ...selectedReport, file_type: e.value })
                  : setNewReport({ ...newReport, file_type: e.value })
              }
              placeholder="Select File Type"
              className={`custom-input ${errors.file_type ? "p-invalid" : ""}`}
            />
            {errors.file_type && (
              <small className="p-error">{errors.file_type}</small>
            )}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="report_type">
              Report Type <span className="required-field">*</span>
            </label>
            <Dropdown
              id="report_type"
              value={
                selectedReport
                  ? selectedReport.report_type
                  : newReport.report_type
              }
              options={[
                { label: "Account", value: "account" },
                { label: "General Ledger", value: "general_ledger" },
              ]}
              onChange={(e) => {
                const value = e.value;
                if (selectedReport) {
                  setSelectedReport({
                    ...selectedReport,
                    report_type: value,
                    // Reset conditional fields when changing report type
                    ...(value !== "account" && { account_type: "" }),
                    ...(value !== "general_ledger" && {
                      filter_by: "",
                      filter_month: "",
                      filter_day: "",
                    }),
                  });
                } else {
                  setNewReport({
                    ...newReport,
                    report_type: value,
                    // Reset conditional fields when changing report type
                    ...(value !== "account" && { account_type: "" }),
                    ...(value !== "general_ledger" && {
                      filter_by: "",
                      filter_month: "",
                      filter_day: "",
                    }),
                  });
                }
              }}
              placeholder="Select Report Type"
              className={`custom-input ${
                errors.report_type ? "p-invalid" : ""
              }`}
            />
            {errors.report_type && (
              <small className="p-error">{errors.report_type}</small>
            )}
          </div>

          {/* Optional Fields */}
          {newReport.report_type === "account" && (
            <div className="p-field custom-field">
              <label htmlFor="account_type">Account Type</label>
              <Dropdown
                id="account_type"
                value={
                  selectedReport
                    ? selectedReport.account_type
                    : newReport.account_type
                }
                options={accounts.map((account) => ({
                  label: account.account_type,
                  value: account.account_type,
                }))}
                onChange={(e) =>
                  selectedReport
                    ? setSelectedReport({
                        ...selectedReport,
                        account_type: e.value,
                      })
                    : setNewReport({ ...newReport, account_type: e.value })
                }
                placeholder="Select Account Type"
                className="custom-input"
              />
            </div>
          )}
          {newReport.report_type === "general_ledger" && (
            <>
              <div className="p-field custom-field">
                <label htmlFor="filter_by">Filter By</label>
                <Dropdown
                  id="filter_by"
                  value={
                    selectedReport
                      ? selectedReport.filter_by
                      : newReport.filter_by
                  }
                  options={[
                    { label: "Month", value: "month" },
                    { label: "Day", value: "day" },
                  ]}
                  onChange={(e) => {
                    const value = e.value;
                    if (selectedReport) {
                      setSelectedReport({
                        ...selectedReport,
                        filter_by: value,
                        // Reset related fields when changing filter type
                        ...(value !== "month" && { filter_month: "" }),
                        ...(value !== "day" && { filter_day: "" }),
                      });
                    } else {
                      setNewReport({
                        ...newReport,
                        filter_by: value,
                        // Reset related fields when changing filter type
                        ...(value !== "month" && { filter_month: "" }),
                        ...(value !== "day" && { filter_day: "" }),
                      });
                    }
                  }}
                  placeholder="Select Filter By"
                  className="custom-input"
                />
              </div>
              {newReport.filter_by === "month" && (
                <div className="p-field custom-field">
                  <label htmlFor="filter_month">Filter Month</label>
                  <Calendar
                    id="filter_month"
                    value={
                      selectedReport
                        ? selectedReport.filter_month
                        : newReport.filter_month
                    }
                    onChange={(e) =>
                      selectedReport
                        ? setSelectedReport({
                            ...selectedReport,
                            filter_month: e.value,
                          })
                        : setNewReport({ ...newReport, filter_month: e.value })
                    }
                    view="month"
                    dateFormat="mm/yy"
                    placeholder="Select Month"
                    className="custom-input"
                  />
                </div>
              )}
              {newReport.filter_by === "day" && (
                <div className="p-field custom-field">
                  <label htmlFor="filter_day">Filter Day</label>
                  <Calendar
                    id="filter_day"
                    value={
                      selectedReport
                        ? selectedReport.filter_day
                        : newReport.filter_day
                    }
                    onChange={(e) =>
                      selectedReport
                        ? setSelectedReport({
                            ...selectedReport,
                            filter_day: e.value,
                          })
                        : setNewReport({ ...newReport, filter_day: e.value })
                    }
                    dateFormat="dd/mm/yy"
                    placeholder="Select Day"
                    className="custom-input"
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="custom-button">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={resetForm}
            className="p-button-text p-button-secondary"
          />
          <Button
            label="Save"
            icon="pi pi-check"
            onClick={handleCreateReport}
            className="p-button custom-save-button"
          />
        </div>
      </Dialog>
    </Layout>
  );
};

export default Reports;
