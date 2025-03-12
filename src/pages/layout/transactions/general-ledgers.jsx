import { useEffect, useState, useRef } from "react";
import Layout from "../../../components/layout/layout";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import {
  getAllGeneralLedgers,
  getGeneralLedgerById,
  deleteGeneralLedger,
  createGeneralLedger,
  updateGeneralLedger,
} from "../../../services/transactions/general-ledgers.js";
import DetailsLedger from "../../../components/layout/ledgers-dialog.jsx";
import { useAuth } from "../../../states/use-auth";
import "../../styles/transactions/general-ledgers.css";

const GeneralLedger = () => {
  const toast = useRef(null);
  const [generalLedgersData, setGeneralLedgersData] = useState([]);
  const [filteredGeneralLedgers, setFilteredGeneralLedgers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [newGeneralLedger, setNewGeneralLedger] = useState({
    transaction_date: null,
    description: "",
    total_debit: 0,
    total_credit: 0,
    remaining_balance: 0,
    isPosting: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGeneralLedger, setSelectedGeneralLedger] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({
    transaction_date: "",
    description: "",
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
      const fetchedGeneralLedgers = await getAllGeneralLedgers();
      setGeneralLedgersData(fetchedGeneralLedgers);
      setFilteredGeneralLedgers(fetchedGeneralLedgers);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch general ledgers",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = generalLedgersData.filter((generalLedger) =>
      generalLedger.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGeneralLedgers(filteredData);
  }, [searchTerm, generalLedgersData]);

  const validateInputs = (generalLedger) => {
    const newErrors = {
      transaction_date: !generalLedger.transaction_date
        ? "Transaction date is required"
        : "",
      description: !generalLedger.description.trim()
        ? "Description is required"
        : "",
    };

    setErrors(newErrors);
    return !newErrors.transaction_date && !newErrors.description;
  };

  const handleCreateGeneralLedger = async () => {
    if (!validateInputs(newGeneralLedger)) {
      return;
    }

    try {
      const formattedDate = new Date(
        newGeneralLedger.transaction_date
      ).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const dataToSubmit = {
        ...newGeneralLedger,
        transaction_date: formattedDate,
      };

      await createGeneralLedger(dataToSubmit);

      await fetchData();

      setVisible(false);
      setNewGeneralLedger({
        transaction_date: null,
        description: "",
        total_debit: 0,
        total_credit: 0,
        remaining_balance: 0,
        isPosting: false,
      });
      setErrors({
        transaction_date: "",
        description: "",
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "General Ledger created successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error creating general ledger:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create general ledger",
        life: 3000,
      });
    }
  };

  const handleEditGeneralLedger = async () => {
    if (!validateInputs(selectedGeneralLedger)) {
      return;
    }

    try {
      const formattedDate = new Date(
        selectedGeneralLedger.transaction_date
      ).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const dataToSubmit = {
        ...selectedGeneralLedger,
        transaction_date: formattedDate,
      };

      await updateGeneralLedger(selectedGeneralLedger.id, dataToSubmit);

      await fetchData();

      setVisible(false);
      setIsEditMode(false);
      setErrors({
        transaction_date: "",
        description: "",
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "General Ledger updated successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error updating general ledger:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update general ledger",
        life: 3000,
      });
    }
  };

  const handleDeleteGeneralLedger = async (id) => {
    try {
      await deleteGeneralLedger(id);

      await fetchData();

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "General Ledger deleted successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error deleting general ledger:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete general ledger",
        life: 3000,
      });
    }
  };

  const handleRowClick = async (rowData) => {
    try {
      const ledgerDetails = await getGeneralLedgerById(rowData.id);
      setSelectedGeneralLedger(ledgerDetails);
      setDetailsVisible(true);
    } catch (error) {
      console.error("Error fetching ledger details:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch ledger details",
        life: 3000,
      });
    }
  };

  const openEditDialog = (rowData) => {
    const formattedGeneralLedger = {
      ...rowData,
      transaction_date: new Date(rowData.transaction_date),
    };

    setSelectedGeneralLedger(formattedGeneralLedger);
    setVisible(true);
    setIsEditMode(true);
    setErrors({
      transaction_date: "",
      description: "",
    });
  };

  const handleCancelEdit = () => {
    setVisible(false);
    setSelectedGeneralLedger(null);
    setIsEditMode(false);
    setErrors({
      transaction_date: "",
      description: "",
    });
  };

  const currencyBodyTemplate = (rowData, field) => {
    return formatCurrency(rowData[field]);
  };

  const actionBodyTemplate = (rowData) => {
    if (currentUser?.role_id !== 1 && currentUser?.role_id !== 2) {
      return null;
    }

    return (
      <div className="action-buttons">
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          severity="info"
          aria-label="Edit"
          onClick={(e) => {
            e.stopPropagation();
            openEditDialog(rowData);
          }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          aria-label="Delete"
          onClick={(e) => {
            e.stopPropagation();
            confirmPopup({
              target: e.currentTarget,
              message: "Are you sure you want to delete this general ledger?",
              icon: "pi pi-exclamation-triangle",
              acceptClassName: "p-button-danger",
              accept: () => handleDeleteGeneralLedger(rowData.id),
              reject: () => {
                toast.current.show({
                  severity: "info",
                  summary: "Cancelled",
                  detail: "Delete action cancelled",
                  life: 3000,
                });
              },
            });
          }}
        />
      </div>
    );
  };

  return (
    <Layout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <Card className="ledgers-container">
        <h2 className="ledgers-title">General Ledgers</h2>
        <div className="ledgers-card">
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
                onClick={() => {
                  setVisible(true);
                  setSelectedGeneralLedger(null);
                  setIsEditMode(false);
                  setErrors({
                    transaction_date: "",
                    description: "",
                  });
                }}
              >
                Create
              </button>
            )}
          </div>
        </div>

        <DataTable
          value={filteredGeneralLedgers}
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
            field="remaining_balance"
            header="Remaining Balance"
            style={{ width: "15%" }}
            body={(rowData) =>
              currencyBodyTemplate(rowData, "remaining_balance")
            }
            sortable
          />
          <Column
            field="isPosting"
            header="Status"
            style={{ width: "10%" }}
            body={(rowData) => (rowData.isPosting ? "Posted" : "Drafted")}
            sortable
          />

          {(currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
            <Column
              body={actionBodyTemplate}
              header="Actions"
              style={{ width: "10%" }}
            />
          )}
        </DataTable>
      </Card>

      <Dialog
        header={
          isEditMode ? "Edit General Ledger" : "Create New General Ledger"
        }
        visible={visible}
        onHide={handleCancelEdit}
        className="custom-dialog"
      >
        <div className="p-fluid">
          <div className="p-field custom-field">
            <label htmlFor="transaction_date">Transaction Date</label>
            <Calendar
              id="transaction_date"
              value={
                selectedGeneralLedger
                  ? selectedGeneralLedger.transaction_date
                  : newGeneralLedger.transaction_date
              }
              onChange={(e) =>
                selectedGeneralLedger
                  ? setSelectedGeneralLedger({
                      ...selectedGeneralLedger,
                      transaction_date: e.value,
                    })
                  : setNewGeneralLedger({
                      ...newGeneralLedger,
                      transaction_date: e.value,
                    })
              }
              dateFormat="dd-mm-yy"
              showIcon
              className={`custom-calendar ${
                errors.transaction_date ? "p-invalid" : ""
              }`}
            />
            {errors.transaction_date && (
              <small className="p-error">{errors.transaction_date}</small>
            )}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="description">Description</label>
            <InputText
              id="description"
              value={
                selectedGeneralLedger
                  ? selectedGeneralLedger.description
                  : newGeneralLedger.description
              }
              onChange={(e) =>
                selectedGeneralLedger
                  ? setSelectedGeneralLedger({
                      ...selectedGeneralLedger,
                      description: e.target.value,
                    })
                  : setNewGeneralLedger({
                      ...newGeneralLedger,
                      description: e.target.value,
                    })
              }
              className={`custom-input ${
                errors.description ? "p-invalid" : ""
              }`}
            />
            {errors.description && (
              <small className="p-error">{errors.description}</small>
            )}
          </div>
        </div>
        <div className="custom-button">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={handleCancelEdit}
            className="p-button p-button-secondary custom-cancel-button"
          />
          <Button
            label={isEditMode ? "Update" : "Save"}
            icon="pi pi-check"
            onClick={
              isEditMode ? handleEditGeneralLedger : handleCreateGeneralLedger
            }
            className="p-button custom-save-button"
          />
        </div>
      </Dialog>

      <DetailsLedger
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        selectedGeneralLedger={selectedGeneralLedger}
      />
    </Layout>
  );
};

export default GeneralLedger;
