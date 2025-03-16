import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { getAllAccounts } from "../../services/transactions/accounts.js";
import {
  getGeneralJournalById,
  createOrUpdateGeneralJournals,
  deleteGeneralJournal,
} from "../../services/transactions/general-journals.js";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { getGeneralLedgerById } from "../../services/transactions/general-ledgers.js";
import { createPosting } from "../../services/transactions/postings.js";
import "../styles/ledgers-dialog.css";

const DetailsLedger = ({ visible, onHide, selectedGeneralLedger }) => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [transactionData, setTransactionData] = useState({
    code: "",
    date: "",
    description: "",
    status: "Posted",
  });
  const [accounts, setAccounts] = useState([]);
  const [journalEditMode, setJournalEditMode] = useState(false);
  const [setSelectedGeneralLedger] = useState(null);
  const [yesterdayBalance, setYesterdayBalance] = useState(0);
  const toast = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (amount) => {
    return amount !== null && amount !== undefined
      ? parseInt(amount, 10).toLocaleString("en-US")
      : "";
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAllAccounts();
        setAccounts(data);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedGeneralLedger) {
      setTransactionData({
        code: selectedGeneralLedger.transaction_code,
        date: formatDate(selectedGeneralLedger.transaction_date),
        description: selectedGeneralLedger.description,
        status: selectedGeneralLedger.isPosting ? "Posted" : "Drafted",
      });
      setJournalEntries(selectedGeneralLedger.journals || []);
      setYesterdayBalance(
        selectedGeneralLedger.yesterday_remaining_balance || 0
      );
    }
  }, [selectedGeneralLedger]);

  // Add new journal row
  const addNewJournalRow = () => {
    const newRow = {
      id: journalEntries.length + 1,
      account_info: { code: "", name: "" },
      description: "",
      debit: "",
      credit: "",
      isNew: true,
    };
    setJournalEntries((prevEntries) => [...prevEntries, newRow]);
  };

  const handleSaveJournal = async () => {
    try {
      const hasNewEntries = journalEntries.some((entry) => entry.isNew);
      const hasModifiedEntries = journalEntries.some(
        (entry) => entry.isModified
      );

      if (!hasNewEntries && !hasModifiedEntries) {
        toast.current.show({
          severity: "info",
          summary: "Info",
          detail: "No changes detected. Exiting edit mode.",
          life: 3000,
        });
        setJournalEditMode(false);
        return;
      }

      const ledgerId = selectedGeneralLedger.id;

      const transactionDate = new Date(selectedGeneralLedger.transaction_date);
      const formattedDate = transactionDate
        .toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/")
        .reverse()
        .join("-");

      const createEntries = [];
      const updateEntries = [];

      journalEntries.forEach((entry) => {
        const debitValue = parseFloat(entry.debit || 0);
        const creditValue = parseFloat(entry.credit || 0);

        if (debitValue !== 0 && creditValue !== 0) {
          throw new Error(
            "Only one of debit or credit should have non-zero value in each entry"
          );
        }

        if (entry.isNew) {
          createEntries.push({
            account_code: entry.account_info.id,
            description: entry.description,
            debit: debitValue.toFixed(2),
            credit: creditValue.toFixed(2),
            transaction_date: formattedDate,
          });
        } else if (entry.isModified) {
          const updateData = {
            id: entry.id,
          };

          if (entry.account_info?.id !== undefined) {
            updateData.account_code = entry.account_info.id;
          }
          if (entry.description !== undefined) {
            updateData.description = entry.description;
          }
          if (entry.debit !== undefined) {
            updateData.debit = debitValue.toFixed(2);
          }
          if (entry.credit !== undefined) {
            updateData.credit = creditValue.toFixed(2);
          }

          updateEntries.push(updateData);
        }
      });

      const response = await createOrUpdateGeneralJournals(
        ledgerId,
        formattedDate,
        createEntries,
        updateEntries
      );
      console.log("Response from server:", response);

      const updatedData = await getGeneralJournalById(selectedGeneralLedger.id);
      setJournalEntries(updatedData.journals || []);

      setJournalEditMode(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Journal entries saved successfully!",
        life: 3000,
      });

      // Tutup dialog
      onHide();

      // Reload window
      window.location.reload();
    } catch (error) {
      console.error("Failed to save journal entries:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          error.message || "Failed to save journal entries. Please try again.",
        life: 3000,
      });
    }
  };

  const handleDeleteJournal = async (id, rowData) => {
    try {
      if (rowData.isNew) {
        const updatedEntries = journalEntries.filter(
          (entry) => entry.id !== id
        );
        setJournalEntries(updatedEntries);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Unsaved journal entry removed.",
          life: 3000,
        });
        return;
      }

      confirmDialog({
        group: "templating",
        header: "Confirmation",
        message: (
          <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
            <i className="pi pi-exclamation-circle text-6xl text-primary-500"></i>
            <span>Are you sure you want to delete this journal entry?</span>
          </div>
        ),
        accept: async () => {
          await deleteGeneralJournal(id);

          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Journal entry deleted successfully.",
            life: 3000,
          });

          const refreshedLedger = await getGeneralLedgerById(
            selectedGeneralLedger.id
          );
          setSelectedGeneralLedger(refreshedLedger);
          setJournalEntries(refreshedLedger.journals || []);
        },
        reject: () => {
          toast.current.show({
            severity: "warn",
            summary: "Cancelled",
            detail: "Delete action cancelled.",
            life: 3000,
          });
        },
        acceptClassName: "p-button-danger",
      });
    } catch (error) {
      console.error("Failed to delete journal entry:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete journal entry. Please try again.",
        life: 3000,
      });
    }
  };

  const codeTemplate = (rowData) => <span>{rowData.account_info.code}</span>;

  const nameTemplate = (rowData, options) => {
    const isEditMode =
      options.props.value === journalEntries ? journalEditMode : false;

    const selectedAccount = accounts.find(
      (account) =>
        account.id === rowData.account_info?.id ||
        account.code === rowData.account_info?.code
    );

    return isEditMode ? (
      <Dropdown
        value={selectedAccount || null}
        options={accounts}
        onChange={(e) => {
          const data = [...options.props.value];
          data[options.rowIndex].account_info = {
            id: e.value.id,
            code: e.value.code,
            name: e.value.name,
          };

          data[options.rowIndex].isModified = true;
          setJournalEntries(data);
        }}
        optionLabel="name"
        placeholder="Select an Account"
      />
    ) : (
      <span>{rowData.account_info?.name || ""}</span>
    );
  };

  const descriptionTemplate = (rowData, options) => {
    const isEditMode =
      options.props.value === journalEntries ? journalEditMode : false;
    return isEditMode ? (
      <InputText
        value={rowData.description}
        onChange={(e) => {
          const data = [...options.props.value];
          data[options.rowIndex].description = e.target.value;

          data[options.rowIndex].isModified = true;
          setJournalEntries(data);
        }}
      />
    ) : (
      <span>{rowData.description}</span>
    );
  };

  const debitTemplate = (rowData, options) => {
    const isEditMode =
      options.props.value === journalEntries ? journalEditMode : false;
    return isEditMode ? (
      <InputText
        value={rowData.debit}
        onChange={(e) => {
          const value = e.target.value;

          if (/^\d*\.?\d*$/.test(value)) {
            const data = [...options.props.value];
            data[options.rowIndex].debit = value;

            data[options.rowIndex].isModified = true;
            setJournalEntries(data);
          }
        }}
      />
    ) : (
      <span>{formatCurrency(rowData.debit)}</span>
    );
  };

  const creditTemplate = (rowData, options) => {
    const isEditMode =
      options.props.value === journalEntries ? journalEditMode : false;
    return isEditMode ? (
      <InputText
        value={rowData.credit}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d*\.?\d*$/.test(value)) {
            const data = [...options.props.value];
            data[options.rowIndex].credit = value;
            data[options.rowIndex].isModified = true;
            setJournalEntries(data);
          }
        }}
      />
    ) : (
      <span>{formatCurrency(rowData.credit)}</span>
    );
  };

  const actionTemplate = (rowData, options) => {
    const isEditMode =
      options.props.value === journalEntries ? journalEditMode : false;
    return isEditMode ? (
      <Button
        icon="pi pi-trash"
        rounded
        outlined
        severity="danger"
        aria-label="Delete"
        onClick={() => handleDeleteJournal(rowData.id, rowData)}
      />
    ) : null;
  };

  const showPostingConfirmation = () => {
    confirmDialog({
      group: "templating",
      header: "Confirmation",
      message: (
        <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
          <i className="pi pi-exclamation-circle text-6xl text-primary-500"></i>
          <span>Are you sure you want to post this ledger?</span>
        </div>
      ),
      accept: handlePostingAccept,
      reject: handlePostingReject,
    });
  };

  const handlePostingAccept = async () => {
    try {
      const response = await createPosting({
        ledger_id: selectedGeneralLedger.id,
        posted_by: user.id,
      });

      if (response.status === "error") {
        throw new Error(response.message);
      }

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Ledger has been posted successfully.",
        life: 3000,
      });

      onHide();

      window.location.reload();
    } catch (error) {
      console.error("Failed to post ledger:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to post ledger. Please try again.",
        life: 3000,
      });
    }
  };

  const handlePostingReject = () => {
    toast.current.show({
      severity: "warn",
      summary: "Rejected",
      detail: "Posting action cancelled.",
      life: 3000,
    });
  };

  const footerContent = (
    <div>
      <Button
        label="Posting"
        severity="success"
        raised
        onClick={showPostingConfirmation}
      />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog group="templating" />
      <Dialog
        header="Details Ledger"
        visible={visible}
        style={{ width: "90%", maxWidth: "900px" }}
        onHide={onHide}
        footer={footerContent}
        className="custom-dialog"
      >
        {/* Transaction Info Section */}
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
                  <span className="value">{transactionData.code}</span>
                </div>
              </div>
              <div className="transaction-field">
                <div className="label-container">
                  <label>Transaction Date</label>
                  <span className="colon">:</span>
                </div>
                <div className="value-container">
                  <span className="value">{transactionData.date}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="transaction-column">
              <div className="transaction-field">
                <div className="label-container">
                  <label>Description</label>
                  <span className="colon">:</span>
                </div>
                <div className="value-container">
                  <span className="value">{transactionData.description}</span>
                </div>
              </div>
              <div className="transaction-field">
                <div className="label-container">
                  <label>Status</label>
                  <span className="colon">:</span>
                </div>
                <div className="value-container">
                  <span className="value">{transactionData.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Divider />

        {/* Daily Journal Section */}
        <div className="section-title">Daily Journal</div>
        <div className="yesterday-field">
          <label>Yesterday Remaining</label>
          <label>:</label>
          <span>{formatCurrency(yesterdayBalance)}</span>
        </div>
        <DataTable
          value={journalEntries}
          showGridlines
          className="ledger-table"
          size="small"
        >
          <Column
            header="No"
            bodyStyle={{ width: "40px" }}
            body={(rowData, options) => options.rowIndex + 1}
          />
          <Column
            field="account_info.code"
            header="Account Code"
            body={codeTemplate}
          />
          <Column
            field="account_info.name"
            header="Account Name"
            body={nameTemplate}
          />
          <Column
            field="description"
            header="Description"
            body={descriptionTemplate}
          />
          <Column field="debit" header="Debit" body={debitTemplate} />
          <Column field="credit" header="Credit" body={creditTemplate} />
          {journalEditMode && (
            <Column
              header="Action"
              body={actionTemplate}
              bodyStyle={{ textAlign: "center", width: "100px" }}
            />
          )}
        </DataTable>

        <div className="table-actions">
          {journalEditMode ? (
            <>
              <Button
                icon="pi pi-plus"
                rounded
                outlined
                severity="secondary"
                aria-label="Add Field Entries"
                onClick={addNewJournalRow}
              />
              <Button
                icon="pi pi-check"
                rounded
                severity="success"
                aria-label="Save"
                onClick={handleSaveJournal}
              />
            </>
          ) : (
            <Button
              icon="pi pi-pencil"
              rounded
              outlined
              severity="info"
              aria-label="Edit"
              onClick={() => setJournalEditMode(true)}
            />
          )}
        </div>

        {/* Balance Section */}
        <Divider />
        <div className="balance-section">
          <div className="balance-label">Balance:</div>
          <div className="balance-fields">
            <div className="balance-field">
              <label>Debit</label>
              <InputText
                value={formatCurrency(selectedGeneralLedger?.total_debit)}
                readOnly
              />
            </div>
            <div className="balance-field">
              <label>Credit</label>
              <InputText
                value={formatCurrency(selectedGeneralLedger?.total_credit)}
                readOnly
              />
            </div>
            <div className="balance-field">
              <label>Remaining</label>
              <InputText
                value={formatCurrency(selectedGeneralLedger?.remaining_balance)}
                readOnly
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

DetailsLedger.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  selectedGeneralLedger: PropTypes.shape({
    id: PropTypes.number,
    transaction_code: PropTypes.string,
    transaction_date: PropTypes.string,
    description: PropTypes.string,
    isPosting: PropTypes.bool,
    journals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        account_info: PropTypes.shape({
          code: PropTypes.string,
          name: PropTypes.string,
        }),
        description: PropTypes.string,
        debit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        credit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
    yesterday_remaining_balance: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    total_debit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_credit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    remaining_balance: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  }),
};

export default DetailsLedger;
