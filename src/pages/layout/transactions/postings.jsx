import { useEffect, useState, useRef } from "react";
import Layout from "../../../components/layout/layout";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { ConfirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import {
  getAllPostings,
  getPostingById,
  unpostMonth,
} from "../../../services/transactions/postings.js";
import { useAuth } from "../../../states/use-auth";
import "../../styles/transactions/postings.css";

const Postings = () => {
  const toast = useRef(null);
  const [postingsData, setPostingsData] = useState([]);
  const [filteredPostings, setFilteredPostings] = useState([]);
  const [visible, setVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [unpostData, setUnpostData] = useState({
    month: null,
    year: null,
  });
  const { user: currentUser } = useAuth();

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "";

    const numValue = typeof value === "string" ? parseFloat(value) : value;

    return numValue.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchData = async () => {
    try {
      const fetchedPostings = await getAllPostings();
      setPostingsData(fetchedPostings);
      setFilteredPostings(fetchedPostings);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch postings",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = postingsData.filter((posting) =>
      posting.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPostings(filteredData);
  }, [searchTerm, postingsData]);

  const handleRowClick = async (rowData) => {
    try {
      const postingDetails = await getPostingById(rowData.id);
      setSelectedPosting(postingDetails);
      setDetailsVisible(true);
    } catch (error) {
      console.error("Error fetching posting details:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch posting details",
        life: 3000,
      });
    }
  };

  const handleUnpostMonth = async () => {
    try {
      if (!unpostData.month || !unpostData.year) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Month and year are required",
          life: 3000,
        });
        return;
      }

      const result = await unpostMonth({
        month: unpostData.month.getMonth() + 1,
        year: unpostData.year.getFullYear(),
        unposted_by: currentUser.id,
      });

      console.log("Unpost result:", result);

      setVisible(false);

      if (result) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: result.message || "Month successfully unposted",
          life: 3000,
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to unpost month: No response from server",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error unposting month:", error);

      setVisible(false);

      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to unpost month",
        life: 3000,
      });
    }
  };

  const currencyBodyTemplate = (rowData, field) => {
    return formatCurrency(rowData[field]);
  };

  return (
    <Layout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <Card className="postings-container">
        <h2 className="postings-title">Journal Post</h2>
        <div className="postings-card">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Description..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
              <button
                className="create-button"
                onClick={() => setVisible(true)}
              >
                Unpost Journal
              </button>
            )}
          </div>
        </div>

        <DataTable
          value={filteredPostings}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 30]}
          tableStyle={{ width: "100%" }}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          onRowClick={(e) => handleRowClick(e.data)}
        >
          <Column
            field="transaction_date"
            header="Transaction Date"
            style={{ width: "15%" }}
            body={(rowData) => formatDate(rowData.transaction_date)}
            sortable
          />
          <Column
            field="description"
            header="Description"
            style={{ width: "25%" }}
            sortable
          />
          <Column
            field="total_debit"
            header="Total Debit"
            style={{ width: "15%" }}
            body={(rowData) => currencyBodyTemplate(rowData, "total_debit")}
            sortable
          />
          <Column
            field="total_credit"
            header="Total Credit"
            style={{ width: "15%" }}
            body={(rowData) => currencyBodyTemplate(rowData, "total_credit")}
            sortable
          />
          <Column
            field="total_balance"
            header="Total Balance"
            style={{ width: "15%" }}
            body={(rowData) => currencyBodyTemplate(rowData, "total_balance")}
            sortable
          />
          <Column
            field="is_unposted"
            header="Status"
            style={{ width: "10%" }}
            body={(rowData) => (rowData.is_unposted ? "Unposted" : "Posted")}
            sortable
          />
        </DataTable>
      </Card>

      <Dialog
        header="Unposting Journal"
        visible={visible}
        onHide={() => setVisible(false)}
        className="custom-dialog"
      >
        <div className="p-fluid">
          <div className="p-field custom-field">
            <label htmlFor="month">Month</label>
            <Calendar
              id="month"
              value={unpostData.month}
              onChange={(e) => setUnpostData({ ...unpostData, month: e.value })}
              view="month"
              dateFormat="mm"
              showIcon
              className="custom-calendar"
            />
          </div>
          <div className="p-field custom-field">
            <label htmlFor="year">Year</label>
            <Calendar
              id="year"
              value={unpostData.year}
              onChange={(e) => setUnpostData({ ...unpostData, year: e.value })}
              view="year"
              dateFormat="yy"
              showIcon
              className="custom-calendar"
            />
          </div>
        </div>
        <div className="custom-button">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={() => setVisible(false)}
            className="p-button p-button-secondary custom-cancel-button"
          />
          <Button
            label="Unpost"
            icon="pi pi-check"
            onClick={handleUnpostMonth}
            className="p-button custom-save-button"
          />
        </div>
      </Dialog>

      <Dialog
        header="Details Posting"
        visible={detailsVisible}
        style={{ width: "90%", maxWidth: "900px" }}
        onHide={() => setDetailsVisible(false)}
        className="custom-dialog"
      >
        {selectedPosting && (
          <>
            <div className="transaction-info">
              <div className="transaction-columns">
                {/* Left Column */}
                <div className="transaction-column">
                  <div className="transaction-field">
                    <div className="label-container">
                      <label>Transaction Code</label>
                      <span className="colon">:</span>
                    </div>
                    <div className="value-container">
                      <span className="value">
                        {selectedPosting.posting.transaction_code}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-field">
                    <div className="label-container">
                      <label>Transaction Date</label>
                      <span className="colon">:</span>
                    </div>
                    <div className="value-container">
                      <span className="value">
                        {formatDate(selectedPosting.posting.transaction_date)}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-field">
                    <div className="label-container">
                      <label>Description</label>
                      <span className="colon">:</span>
                    </div>
                    <div className="value-container">
                      <span className="value">
                        {selectedPosting.posting.description}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-field">
                    <div className="label-container">
                      <label>Status</label>
                      <span className="colon">:</span>
                    </div>
                    <div className="value-container">
                      <span className="value">
                        {selectedPosting.posting.is_unposted
                          ? "Unposted"
                          : "Posted"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="transaction-column">
                  <div className="transaction-field">
                    <div className="label-container">
                      <label>Posted By</label>
                      <span className="colon">:</span>
                    </div>
                    <div className="value-container">
                      <span className="value">
                        {selectedPosting.posting.posted_by_name}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-field">
                    <div className="label-container">
                      <label>Posting Date</label>
                      <span className="colon">:</span>
                    </div>
                    <div className="value-container">
                      <span className="value">
                        {formatDate(selectedPosting.posting.posting_date)}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-field">
                    <div className="label-container">
                      <label>Period</label>
                      <span className="colon">:</span>
                    </div>
                    <div className="value-container">
                      <span className="value">
                        {selectedPosting.posting.period_month}/
                        {selectedPosting.posting.period_year}
                      </span>
                    </div>
                  </div>
                  {selectedPosting.posting.is_unposted && (
                    <div className="transaction-field">
                      <div className="label-container">
                        <label>Unposting Date</label>
                        <span className="colon">:</span>
                      </div>
                      <div className="value-container">
                        <span className="value">
                          {formatDate(selectedPosting.posting.unposting_date)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Divider />

            <div className="section-title">Daily Journal</div>
            <DataTable
              value={selectedPosting.details}
              showGridlines
              className="ledger-table"
              size="small"
            >
              <Column
                header="No"
                bodyStyle={{ width: "40px" }}
                body={(rowData, options) => options.rowIndex + 1}
              />
              <Column field="account_code_number" header="Account Code" />
              <Column field="account_name" header="Account Name" />
              <Column field="description" header="Description" />
              <Column
                field="debit"
                header="Debit"
                body={(rowData) => formatCurrency(rowData.debit)}
              />
              <Column
                field="credit"
                header="Credit"
                body={(rowData) => formatCurrency(rowData.credit)}
              />
              <Column
                field="balance"
                header="Balance"
                body={(rowData) => formatCurrency(rowData.balance)}
              />
            </DataTable>

            <Divider />

            <div className="balance-section">
              <div className="balance-label">Balance:</div>
              <div className="balance-fields">
                <div className="balance-field">
                  <label>Total Debit</label>
                  <InputText
                    value={formatCurrency(selectedPosting.posting.total_debit)}
                    readOnly
                  />
                </div>
                <div className="balance-field">
                  <label>Total Credit</label>
                  <InputText
                    value={formatCurrency(selectedPosting.posting.total_credit)}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </Dialog>
    </Layout>
  );
};

export default Postings;
