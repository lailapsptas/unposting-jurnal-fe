import { useEffect, useState, useRef } from "react";
import Layout from "../../../components/layout/layout";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import {
  getAllAccounts,
  deleteAccount,
  createAccount,
  getAccountById,
  updateAccount,
} from "../../../services/transactions/accounts.js";
import { useAuth } from "../../../states/use-auth";
import "../../styles/transactions/accounts.css";

const Accounts = () => {
  const toast = useRef(null);
  const [accountsData, setAccountsData] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [visible, setVisible] = useState(false);
  const [newAccount, setNewAccount] = useState({
    code: "",
    name: "",
    description: "",
    account_type: "",
    currency: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialAccountData, setInitialAccountData] = useState(null);
  const [errors, setErrors] = useState({
    code: "",
    name: "",
    description: "",
    account_type: "",
    currency: "",
  });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAccounts = await getAllAccounts();
        setAccountsData(fetchedAccounts);
        setFilteredAccounts(fetchedAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = accountsData.filter(
      (account) =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.account_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAccounts(filteredData);
  }, [searchTerm, accountsData]);

  const validateInputs = (account) => {
    const newErrors = {
      code: !account.code.trim() ? "Code is required" : "",
      name: !account.name.trim() ? "Name is required" : "",
      description: !account.description.trim() ? "Description is required" : "",
      account_type: !account.account_type ? "Account Type is required" : "",
      currency: !account.currency ? "Currency is required" : "",
    };
    setErrors(newErrors);
    return (
      !newErrors.code &&
      !newErrors.name &&
      !newErrors.description &&
      !newErrors.account_type &&
      !newErrors.currency
    );
  };

  const handleCreateAccount = async () => {
    if (!validateInputs(newAccount)) {
      return;
    }

    try {
      const createdAccount = await createAccount(newAccount);
      setAccountsData((prevAccounts) => [...prevAccounts, createdAccount]);
      setVisible(false);
      setNewAccount({
        code: "",
        name: "",
        description: "",
        account_type: "",
        currency: "",
      });
      setErrors({
        code: "",
        name: "",
        description: "",
        account_type: "",
        currency: "",
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Account created successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error creating account:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create account",
        life: 3000,
      });
    }
  };

  const handleEditAccount = async () => {
    if (!validateInputs(selectedAccount)) {
      return;
    }

    try {
      await updateAccount(selectedAccount.id, selectedAccount);
      setAccountsData((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === selectedAccount.id ? selectedAccount : account
        )
      );
      setIsEditMode(false);
      setErrors({
        code: "",
        name: "",
        description: "",
        account_type: "",
        currency: "",
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Account updated successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error updating account:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update account",
        life: 3000,
      });
    }
  };

  const handleActiveStatusChange = async (rowData, newStatus) => {
    try {
      // Update status di server
      await updateAccount(rowData.id, { ...rowData, active: newStatus });

      // Update status di state lokal
      setAccountsData((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === rowData.id
            ? { ...account, active: newStatus }
            : account
        )
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `Account status updated to ${
          newStatus ? "Active" : "Inactive"
        }`,
        life: 3000,
      });
    } catch (error) {
      console.error("Error updating account status:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update account status",
        life: 3000,
      });
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await deleteAccount(id);
      setAccountsData((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== id)
      );
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Account deleted successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete account",
        life: 3000,
      });
    }
  };

  const handleRowClick = async (rowData) => {
    try {
      const account = await getAccountById(rowData.id);
      setSelectedAccount(account);
      setInitialAccountData(account);
      setVisible(true);
      setIsEditMode(false);
      setErrors({
        code: "",
        name: "",
        description: "",
        account_type: "",
        currency: "",
      });
    } catch (error) {
      console.error("Error fetching account by ID:", error);
    }
  };

  const handleCancelEdit = () => {
    setSelectedAccount(initialAccountData);
    setIsEditMode(false);
    setErrors({
      code: "",
      name: "",
      description: "",
      account_type: "",
      currency: "",
    });
  };

  const actionBodyTemplate = (rowData) => {
    if (currentUser?.role_id !== 1 && currentUser?.role_id !== 2) {
      return null;
    }

    return (
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
            message: "Are you sure you want to delete this account?",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            accept: () => handleDeleteAccount(rowData.id),
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
    );
  };

  const activeStatusBodyTemplate = (rowData) => {
    return (
      <Dropdown
        value={rowData.active}
        options={[
          { label: "Active", value: true },
          { label: "Inactive", value: false },
        ]}
        onChange={(e) => handleActiveStatusChange(rowData, e.value)}
        disabled={currentUser?.role_id !== 1 && currentUser?.role_id !== 2}
        className={`status-dropdown ${
          rowData.active ? "status-active" : "status-inactive"
        }`}
      />
    );
  };

  return (
    <Layout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <Card className="account-container">
        <h2 className="account-title">Accounts</h2>
        <div className="account-card">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Name or Type..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
              <button
                className="create-button"
                onClick={() => {
                  setVisible(true);
                  setSelectedAccount(null);
                  setIsEditMode(false);
                  setErrors({
                    code: "",
                    name: "",
                    description: "",
                    account_type: "",
                    currency: "",
                  });
                }}
              >
                Create
              </button>
            )}
          </div>
        </div>

        <DataTable
          value={filteredAccounts}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 30]}
          tableStyle={{ width: "100%" }}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          onRowClick={(e) => handleRowClick(e.data)}
        >
          <Column field="id" header="ID" style={{ width: "10%" }} sortable />
          <Column
            field="name"
            header="Name"
            style={{ width: "25%" }}
            sortable
          />
          <Column
            field="account_type"
            header="Account Type"
            style={{ width: "20%" }}
            sortable
          />
          <Column
            field="currency"
            header="Currency"
            style={{ width: "15%" }}
            sortable
          />
          <Column
            field="active"
            header="Active"
            style={{ width: "20%" }}
            body={activeStatusBodyTemplate}
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
        header={selectedAccount ? "Account Details" : "Create New Account"}
        visible={visible}
        onHide={() => {
          setVisible(false);
          setSelectedAccount(null);
          setIsEditMode(false);
          setErrors({
            code: "",
            name: "",
            description: "",
            account_type: "",
            currency: "",
          });
        }}
        className="custom-dialog"
      >
        <div className="p-fluid">
          <div className="p-field custom-field">
            <label htmlFor="code">Code</label>
            <InputText
              id="code"
              value={selectedAccount ? selectedAccount.code : newAccount.code}
              onChange={(e) =>
                selectedAccount
                  ? setSelectedAccount({
                      ...selectedAccount,
                      code: e.target.value,
                    })
                  : setNewAccount({ ...newAccount, code: e.target.value })
              }
              className={`custom-input ${errors.code ? "p-invalid" : ""}`}
              readOnly={selectedAccount && !isEditMode}
            />
            {errors.code && <small className="p-error">{errors.code}</small>}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="name">Name</label>
            <InputText
              id="name"
              value={selectedAccount ? selectedAccount.name : newAccount.name}
              onChange={(e) =>
                selectedAccount
                  ? setSelectedAccount({
                      ...selectedAccount,
                      name: e.target.value,
                    })
                  : setNewAccount({ ...newAccount, name: e.target.value })
              }
              className={`custom-input ${errors.name ? "p-invalid" : ""}`}
              readOnly={selectedAccount && !isEditMode}
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="description">Description</label>
            <InputText
              id="description"
              value={
                selectedAccount
                  ? selectedAccount.description
                  : newAccount.description
              }
              onChange={(e) =>
                selectedAccount
                  ? setSelectedAccount({
                      ...selectedAccount,
                      description: e.target.value,
                    })
                  : setNewAccount({
                      ...newAccount,
                      description: e.target.value,
                    })
              }
              className={`custom-input ${
                errors.description ? "p-invalid" : ""
              }`}
              readOnly={selectedAccount && !isEditMode}
            />
            {errors.description && (
              <small className="p-error">{errors.description}</small>
            )}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="account_type">Account Type</label>
            <InputText
              id="account_type"
              value={
                selectedAccount
                  ? selectedAccount.account_type
                  : newAccount.account_type
              }
              onChange={(e) =>
                selectedAccount
                  ? setSelectedAccount({
                      ...selectedAccount,
                      account_type: e.target.value,
                    })
                  : setNewAccount({
                      ...newAccount,
                      account_type: e.target.value,
                    })
              }
              className={`custom-input ${
                errors.account_type ? "p-invalid" : ""
              }`}
              readOnly={selectedAccount && !isEditMode}
            />
            {errors.account_type && (
              <small className="p-error">{errors.account_type}</small>
            )}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="currency">Currency</label>
            <Dropdown
              id="currency"
              value={
                selectedAccount ? selectedAccount.currency : newAccount.currency
              }
              options={[
                { label: "USD", value: "USD" },
                { label: "IDR", value: "IDR" },
                { label: "EUR", value: "EUR" },
              ]}
              onChange={(e) =>
                selectedAccount
                  ? setSelectedAccount({
                      ...selectedAccount,
                      currency: e.value,
                    })
                  : setNewAccount({ ...newAccount, currency: e.value })
              }
              placeholder="Select Currency"
              className={`custom-input ${errors.currency ? "p-invalid" : ""}`}
              disabled={selectedAccount && !isEditMode}
            />
            {errors.currency && (
              <small className="p-error">{errors.currency}</small>
            )}
          </div>
        </div>
        <div className="custom-button">
          {selectedAccount ? (
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
                    onClick={handleEditAccount}
                    className="p-button custom-save-button"
                  />
                </>
              ) : (
                (currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
                  <Button
                    label="Edit"
                    icon="pi pi-pencil"
                    onClick={() => setIsEditMode(true)}
                    className="p-button custom-edit-button"
                  />
                )
              )}
            </>
          ) : (
            (currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
              <Button
                label="Save"
                icon="pi pi-check"
                onClick={handleCreateAccount}
                className="p-button custom-save-button"
              />
            )
          )}
        </div>
      </Dialog>
    </Layout>
  );
};

export default Accounts;
