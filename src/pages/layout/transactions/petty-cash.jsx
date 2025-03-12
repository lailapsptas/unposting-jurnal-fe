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
import { Dropdown } from "primereact/dropdown";
import {
  getAllPettyCashes,
  deletePettyCash,
  createPettyCash,
  getPettyCashById,
  updatePettyCash,
  approvePettyCash,
} from "../../../services/transactions/petty-cashes.js";
import { getAllAccounts } from "../../../services/transactions/accounts.js";
import { getAllUsers } from "../../../services/settings/users.js";
import { useAuth } from "../../../states/use-auth";
import "../../styles/transactions/petty-cash.css";

const PettyCashes = () => {
  const toast = useRef(null);
  const [pettyCashesData, setPettyCashesData] = useState([]);
  const [filteredPettyCashes, setFilteredPettyCashes] = useState([]);
  const [visible, setVisible] = useState(false);
  const [newPettyCash, setNewPettyCash] = useState({
    user_id: "",
    account_code: "",
    description: "",
    debit: "0",
    credit: "0",
    transaction_date: new Date(),
    isapproved: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPettyCash, setSelectedPettyCash] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialPettyCashData, setInitialPettyCashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    user_id: "",
    account_code: "",
    description: "",
    debit: "",
    credit: "",
    transaction_date: "",
  });
  // New state for accounts and users dropdown options
  const [accountOptions, setAccountOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  const { user: currentUser } = useAuth();

  // Format currency for display (123,000)
  const formatCurrencyForDisplay = (value) => {
    if (!value) return "0";

    // First, ensure we have a valid number by removing any non-numeric characters except dots
    let numValue = value.toString().replace(/[^\d.]/g, "");

    // Convert to a number
    numValue = parseFloat(numValue);

    // Check if it's a valid number
    if (isNaN(numValue)) return "0";

    // Format with no decimal places and with commas as thousand separators
    return Math.floor(numValue)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Parse formatted currency back to number for database
  const parseFormattedCurrency = (formattedValue) => {
    if (!formattedValue) return "0.00";
    // Remove commas
    const numericValue = formattedValue.toString().replace(/,/g, "");
    // Convert to number and format with 2 decimal places
    return parseFloat(numericValue || 0).toFixed(2);
  };

  // Fetch users and accounts data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [accountsData, usersData] = await Promise.all([
          getAllAccounts(),
          getAllUsers(),
        ]);

        // Format account options for dropdown
        const accountOpts = accountsData.map((account) => ({
          label: `${account.code} - ${account.name}`,
          value: account.id,
        }));

        // Format user options for dropdown
        const userOpts = usersData.map((user) => ({
          label: user.full_name,
          value: user.id,
        }));

        setAccountOptions(accountOpts);
        setUserOptions(userOpts);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load dropdown data",
          life: 3000,
        });
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const response = await getAllPettyCashes();
        const fetchedPettyCashes = response.data || [];
        setPettyCashesData(fetchedPettyCashes);
        setFilteredPettyCashes(fetchedPettyCashes);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load data",
          life: 3000,
        });
        setPettyCashesData([]);
        setFilteredPettyCashes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(pettyCashesData)) {
      setFilteredPettyCashes([]);
      return;
    }

    const filteredData = pettyCashesData.filter(
      (pettyCash) =>
        pettyCash.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        pettyCash.users[0]?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredPettyCashes(filteredData);
  }, [searchTerm, pettyCashesData]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const validateInputs = (pettyCash) => {
    const newErrors = {
      user_id: !pettyCash.user_id ? "User is required" : "",
      account_code: !pettyCash.account_code ? "Account is required" : "",
      description: !pettyCash.description?.trim()
        ? "Description is required"
        : "",
      debit:
        parseFloat(parseFormattedCurrency(pettyCash.debit)) < 0
          ? "Debit must be greater than or equal to 0"
          : "",
      credit:
        parseFloat(parseFormattedCurrency(pettyCash.credit)) < 0
          ? "Credit must be greater than or equal to 0"
          : "",
      transaction_date: !pettyCash.transaction_date ? "Date is required" : "",
    };
    setErrors(newErrors);
    return (
      !newErrors.user_id &&
      !newErrors.account_code &&
      !newErrors.description &&
      !newErrors.debit &&
      !newErrors.credit &&
      !newErrors.transaction_date
    );
  };

  const handleCreatePettyCash = async () => {
    if (!validateInputs(newPettyCash)) {
      return;
    }

    try {
      // Format the date to yyyy-mm-dd and convert currency strings to proper format
      const formattedData = {
        ...newPettyCash,
        transaction_date: formatDate(newPettyCash.transaction_date),
        debit: parseFormattedCurrency(newPettyCash.debit),
        credit: parseFormattedCurrency(newPettyCash.credit),
      };

      const response = await createPettyCash(formattedData);
      const createdPettyCash = response.data;

      setPettyCashesData((prevPettyCashes) => [
        ...prevPettyCashes,
        createdPettyCash,
      ]);
      setVisible(false);
      setNewPettyCash({
        user_id: "",
        account_code: "",
        description: "",
        debit: "0.00",
        credit: "0.00",
        transaction_date: new Date(),
        isapproved: false,
      });
      setErrors({
        user_id: "",
        account_code: "",
        description: "",
        debit: "",
        credit: "",
        transaction_date: "",
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Petty Cash created successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error creating petty cash:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create petty cash",
        life: 3000,
      });
    }
  };

  const handleEditPettyCash = async () => {
    if (!validateInputs(selectedPettyCash)) {
      return;
    }

    try {
      // Format the date to yyyy-mm-dd and convert currency strings to proper format
      const formattedData = {
        ...selectedPettyCash,
        transaction_date: formatDate(selectedPettyCash.transaction_date),
        debit: parseFormattedCurrency(selectedPettyCash.debit),
        credit: parseFormattedCurrency(selectedPettyCash.credit),
      };

      const response = await updatePettyCash(
        selectedPettyCash.id,
        formattedData
      );
      const updatedPettyCash = response.data;

      setPettyCashesData((prevPettyCashes) =>
        prevPettyCashes.map((pettyCash) =>
          pettyCash.id === selectedPettyCash.id ? updatedPettyCash : pettyCash
        )
      );
      setIsEditMode(false);
      setVisible(false);
      setErrors({
        user_id: "",
        account_code: "",
        description: "",
        debit: "",
        credit: "",
        transaction_date: "",
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Petty Cash updated successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error updating petty cash:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update petty cash",
        life: 3000,
      });
    }
  };

  const handleApprovePettyCash = async (id) => {
    try {
      const approvedData = { isapproved: true };
      await approvePettyCash(id, approvedData);
      setPettyCashesData((prevPettyCashes) =>
        prevPettyCashes.map((pettyCash) =>
          pettyCash.id === id ? { ...pettyCash, isapproved: true } : pettyCash
        )
      );

      // If the currently selected petty cash is the one being approved, update it
      if (selectedPettyCash && selectedPettyCash.id === id) {
        setSelectedPettyCash({
          ...selectedPettyCash,
          isapproved: true,
        });
        // If in edit mode, exit it since approved items shouldn't be editable
        if (isEditMode) {
          setIsEditMode(false);
        }
      }

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Petty Cash approved successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error approving petty cash:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to approve petty cash",
        life: 3000,
      });
    }
  };

  const handleDeletePettyCash = async (id) => {
    try {
      await deletePettyCash(id);
      setPettyCashesData((prevPettyCashes) =>
        prevPettyCashes.filter((pettyCash) => pettyCash.id !== id)
      );

      // If the deleted petty cash is currently being viewed, close the dialog
      if (selectedPettyCash && selectedPettyCash.id === id) {
        setVisible(false);
      }

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Petty Cash deleted successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error deleting petty cash:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete petty cash",
        life: 3000,
      });
    }
  };

  const handleRowClick = async (rowData) => {
    try {
      const response = await getPettyCashById(rowData.id);
      const pettyCash = response.data;

      const pettyCashWithFormattedValues = {
        ...pettyCash,
        transaction_date: new Date(pettyCash.transaction_date),
        debit: formatCurrencyForDisplay(pettyCash.debit),
        credit: formatCurrencyForDisplay(pettyCash.credit),
      };

      setSelectedPettyCash(pettyCashWithFormattedValues);
      setInitialPettyCashData(pettyCashWithFormattedValues);
      setVisible(true);
      setIsEditMode(false);
      setErrors({
        user_id: "",
        account_code: "",
        description: "",
        debit: "",
        credit: "",
        transaction_date: "",
      });
    } catch (error) {
      console.error("Error fetching petty cash by ID:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load petty cash details",
        life: 3000,
      });
    }
  };

  const handleCancelEdit = () => {
    setSelectedPettyCash(initialPettyCashData);
    setIsEditMode(false);
    setErrors({
      user_id: "",
      account_code: "",
      description: "",
      debit: "",
      credit: "",
      transaction_date: "",
    });
  };

  const handleDebitChange = (e, target) => {
    // Get the raw input value without any formatting
    const inputValue = e.target.value.replace(/,/g, "");

    // Only apply formatting if there's a valid number
    if (inputValue === "" || isNaN(parseFloat(inputValue))) {
      if (target === "selected") {
        setSelectedPettyCash({
          ...selectedPettyCash,
          debit: "0",
        });
      } else {
        setNewPettyCash({
          ...newPettyCash,
          debit: "0",
        });
      }
      return;
    }

    const formattedValue = formatCurrencyForDisplay(inputValue);

    if (target === "selected") {
      setSelectedPettyCash({
        ...selectedPettyCash,
        debit: formattedValue,
      });
    } else {
      setNewPettyCash({
        ...newPettyCash,
        debit: formattedValue,
      });
    }
  };

  const handleCreditChange = (e, target) => {
    // Get the raw input value without any formatting
    const inputValue = e.target.value.replace(/,/g, "");

    // Only apply formatting if there's a valid number
    if (inputValue === "" || isNaN(parseFloat(inputValue))) {
      if (target === "selected") {
        setSelectedPettyCash({
          ...selectedPettyCash,
          credit: "0",
        });
      } else {
        setNewPettyCash({
          ...newPettyCash,
          credit: "0",
        });
      }
      return;
    }

    const formattedValue = formatCurrencyForDisplay(inputValue);

    if (target === "selected") {
      setSelectedPettyCash({
        ...selectedPettyCash,
        credit: formattedValue,
      });
    } else {
      setNewPettyCash({
        ...newPettyCash,
        credit: formattedValue,
      });
    }
  };

  const actionBodyTemplate = (rowData) => {
    if (currentUser?.role_id !== 1 && currentUser?.role_id !== 2) {
      return null;
    }

    return (
      <div className="action-buttons">
        {!rowData.isapproved && (
          <Button
            icon="pi pi-check"
            rounded
            outlined
            severity="success"
            aria-label="Approve"
            onClick={(e) => {
              e.stopPropagation();
              handleApprovePettyCash(rowData.id);
            }}
          />
        )}
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
              message: "Are you sure you want to delete this petty cash?",
              icon: "pi pi-exclamation-triangle",
              acceptClassName: "p-button-danger",
              accept: () => handleDeletePettyCash(rowData.id),
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

  const statusBodyTemplate = (rowData) => {
    return (
      <span
        className={`status-badge status-${
          rowData.isapproved ? "approved" : "pending"
        }`}
      >
        {rowData.isapproved ? "Approved" : "Pending"}
      </span>
    );
  };

  // Modified to display the date in yyyy-mm-dd format
  const dateTemplate = (rowData) => {
    if (!rowData.transaction_date) return "";
    const date = new Date(rowData.transaction_date);
    return formatDate(date);
  };

  // Modified to format the currency as requested (123,000) without Rp symbol for table display
  const formatCurrency = (value) => {
    if (!value || isNaN(parseFloat(value))) return "0";
    return parseFloat(value)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const currencyTemplate = (rowData, field) => {
    return formatCurrency(rowData[field]);
  };

  // Render the edit button only if the petty cash is not approved
  const renderEditButton = () => {
    if (
      selectedPettyCash &&
      !selectedPettyCash.isapproved &&
      (currentUser?.role_id === 1 || currentUser?.role_id === 2)
    ) {
      return (
        <Button
          label="Edit"
          icon="pi pi-pencil"
          onClick={() => setIsEditMode(true)}
          className="p-button custom-edit-button"
        />
      );
    }
    return null;
  };

  return (
    <Layout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <Card className="petty-cashes-container">
        <h2 className="petty-cashes-title">Petty Cashes</h2>
        <div className="petty-cashes-card">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Description or User..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
              <button
                className="create-button"
                onClick={() => {
                  setVisible(true);
                  setSelectedPettyCash(null);
                  setIsEditMode(false);
                  setNewPettyCash({
                    user_id: "",
                    account_code: "",
                    description: "",
                    debit: "0",
                    credit: "0",
                    transaction_date: new Date(),
                    isapproved: false,
                  });
                  setErrors({
                    user_id: "",
                    account_code: "",
                    description: "",
                    debit: "",
                    credit: "",
                    transaction_date: "",
                  });
                }}
              >
                Create
              </button>
            )}
          </div>
        </div>

        <DataTable
          value={filteredPettyCashes}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 30]}
          tableStyle={{ width: "100%" }}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          onRowClick={(e) => handleRowClick(e.data)}
          loading={loading}
          emptyMessage="No petty cash records found"
        >
          <Column
            field="transaction_date"
            header="Submission Date"
            style={{ width: "10%" }}
            body={dateTemplate}
            sortable
          />
          <Column
            field="users"
            header="User Name"
            style={{ width: "25%" }}
            body={(rowData) => {
              if (rowData.users && rowData.users.length > 0) {
                return rowData.users[0].name;
              }
              return "Unknown User";
            }}
            sortable
          />
          <Column
            field="description"
            header="Description"
            style={{ width: "25%" }}
            sortable
          />
          <Column
            field="debit"
            header="Debit"
            style={{ width: "12%" }}
            body={(rowData) => currencyTemplate(rowData, "debit")}
            sortable
          />
          <Column
            field="credit"
            header="Credit"
            style={{ width: "12%" }}
            body={(rowData) => currencyTemplate(rowData, "credit")}
            sortable
          />
          <Column
            field="isapproved"
            header="Status"
            style={{ width: "11%" }}
            body={statusBodyTemplate}
            sortable
          />
          {(currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
            <Column
              body={actionBodyTemplate}
              header="Actions"
              style={{ width: "15%" }}
            />
          )}
        </DataTable>
      </Card>

      <Dialog
        header={
          selectedPettyCash ? "Petty Cash Details" : "Create New Petty Cash"
        }
        visible={visible}
        onHide={() => {
          setVisible(false);
          setSelectedPettyCash(null);
          setIsEditMode(false);
          setErrors({
            user_id: "",
            account_code: "",
            description: "",
            debit: "",
            credit: "",
            transaction_date: "",
          });
        }}
        className="custom-dialog"
      >
        <div className="p-fluid">
          <div className="p-field custom-field">
            <label htmlFor="transaction_date">Transaction Date</label>
            <Calendar
              id="transaction_date"
              value={
                selectedPettyCash
                  ? selectedPettyCash.transaction_date
                  : newPettyCash.transaction_date
              }
              onChange={(e) =>
                selectedPettyCash
                  ? setSelectedPettyCash({
                      ...selectedPettyCash,
                      transaction_date: e.value,
                    })
                  : setNewPettyCash({
                      ...newPettyCash,
                      transaction_date: e.value,
                    })
              }
              dateFormat="dd-mm-yy"
              showIcon
              className={`custom-calendar ${
                errors.transaction_date ? "p-invalid" : ""
              }`}
              readOnly={!isEditMode && selectedPettyCash}
              disabled={selectedPettyCash?.isapproved}
            />
            {errors.transaction_date && (
              <small className="p-error">{errors.transaction_date}</small>
            )}
          </div>

          <div className="p-field custom-field">
            <label htmlFor="user_id">User</label>
            <Dropdown
              id="user_id"
              value={
                selectedPettyCash
                  ? selectedPettyCash.user_id
                  : newPettyCash.user_id
              }
              options={userOptions}
              onChange={(e) =>
                selectedPettyCash
                  ? setSelectedPettyCash({
                      ...selectedPettyCash,
                      user_id: e.value,
                    })
                  : setNewPettyCash({
                      ...newPettyCash,
                      user_id: e.value,
                    })
              }
              placeholder="Select a User"
              className={`custom-dropdown ${errors.user_id ? "p-invalid" : ""}`}
              disabled={
                (!isEditMode && selectedPettyCash) ||
                selectedPettyCash?.isapproved
              }
              filter
              filterBy="label"
            />
            {errors.user_id && (
              <small className="p-error">{errors.user_id}</small>
            )}
          </div>

          <div className="p-field custom-field">
            <label htmlFor="account_code">Account</label>
            <Dropdown
              id="account_code"
              value={
                selectedPettyCash
                  ? selectedPettyCash.account_code
                  : newPettyCash.account_code
              }
              options={accountOptions}
              onChange={(e) =>
                selectedPettyCash
                  ? setSelectedPettyCash({
                      ...selectedPettyCash,
                      account_code: e.value,
                    })
                  : setNewPettyCash({
                      ...newPettyCash,
                      account_code: e.value,
                    })
              }
              placeholder="Select an Account"
              className={`custom-dropdown ${
                errors.account_code ? "p-invalid" : ""
              }`}
              disabled={
                (!isEditMode && selectedPettyCash) ||
                selectedPettyCash?.isapproved
              }
              filter
              filterBy="label"
            />
            {errors.account_code && (
              <small className="p-error">{errors.account_code}</small>
            )}
          </div>

          <div className="p-field custom-field">
            <label htmlFor="description">Description</label>
            <InputText
              id="description"
              value={
                selectedPettyCash
                  ? selectedPettyCash.description
                  : newPettyCash.description
              }
              onChange={(e) =>
                selectedPettyCash
                  ? setSelectedPettyCash({
                      ...selectedPettyCash,
                      description: e.target.value,
                    })
                  : setNewPettyCash({
                      ...newPettyCash,
                      description: e.target.value,
                    })
              }
              className={`custom-input ${
                errors.description ? "p-invalid" : ""
              }`}
              readOnly={!isEditMode && selectedPettyCash}
              disabled={selectedPettyCash?.isapproved}
            />
            {errors.description && (
              <small className="p-error">{errors.description}</small>
            )}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="debit">Debit</label>
            <InputText
              id="debit"
              value={
                selectedPettyCash ? selectedPettyCash.debit : newPettyCash.debit
              }
              onChange={(e) =>
                selectedPettyCash
                  ? handleDebitChange(e, "selected")
                  : handleDebitChange(e, "new")
              }
              className={`custom-input ${errors.debit ? "p-invalid" : ""}`}
              readOnly={!isEditMode && selectedPettyCash}
              disabled={selectedPettyCash?.isapproved}
              placeholder="0"
              maxLength="20"
            />
            {errors.debit && <small className="p-error">{errors.debit}</small>}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="credit">Credit</label>
            <InputText
              id="credit"
              value={
                selectedPettyCash
                  ? selectedPettyCash.credit
                  : newPettyCash.credit
              }
              onChange={(e) =>
                selectedPettyCash
                  ? handleCreditChange(e, "selected")
                  : handleCreditChange(e, "new")
              }
              className={`custom-input ${errors.credit ? "p-invalid" : ""}`}
              readOnly={!isEditMode && selectedPettyCash}
              disabled={selectedPettyCash?.isapproved}
              placeholder="0"
              maxLength="20"
            />
            {errors.credit && (
              <small className="p-error">{errors.credit}</small>
            )}
          </div>

          {selectedPettyCash?.isapproved && (
            <div className="p-field custom-field approved-message">
              <span className="approved-text">
                <i
                  className="pi pi-check-circle"
                  style={{ marginRight: "8px", color: "#4caf50" }}
                ></i>
                This petty cash entry has been approved and cannot be edited
              </span>
            </div>
          )}
        </div>
        <div className="custom-button">
          {selectedPettyCash ? (
            <>
              {isEditMode ? (
                <>
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    onClick={handleCancelEdit}
                    className="p-button custom-cancel-button"
                  />
                  <Button
                    label="Save"
                    icon="pi pi-check"
                    onClick={handleEditPettyCash}
                    className="p-button custom-save-button"
                  />
                </>
              ) : (
                renderEditButton()
              )}
            </>
          ) : (
            (currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
              <Button
                label="Save"
                icon="pi pi-check"
                onClick={handleCreatePettyCash}
                className="p-button custom-save-button"
              />
            )
          )}
        </div>
      </Dialog>
    </Layout>
  );
};

export default PettyCashes;
