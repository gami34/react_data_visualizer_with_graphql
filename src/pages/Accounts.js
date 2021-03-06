import React, { useEffect, useState } from "react";

import Datepicker from "../partials/actions/Datepicker";
import DisplayDashCard from "../partials/dashboard/DisplayDashCard";
import AccountsTable from "../partials/dashboard/AccountsTable";
import ColumnChart from "../partials/dashboard/ColumnChart";

import { useQuery } from "@apollo/client";
import _ from "lodash";
import { ALL_ACCOUNTS } from "../graphql/queries";
import moment from "moment";
import { generateChartData } from "../utils/generateChartData.util";

// Import utilities
// import { tailwindConfig } from "../utils/Utils";

function Accounts() {
    const [startDate, setStartDate] = useState("2021-07-09T00:00:00.000Z"); // most recent date from the dataset
    const [endDate, setEndDate] = useState("2021-09-16T08:49:43.991Z");

    const [allAccounts, setAllAccounts] = useState([]);
    const [noAccounts, setNoAccounts] = useState(0);
    const [noCheques, setNoCheques] = useState(0);
    const [noSavings, setNoSavings] = useState(0);
    const [chartData, setChartData] = useState([]);

    // fetch all acounts data from the graphql server for the first 7days
    const { data, loading } = useQuery(ALL_ACCOUNTS, {
        variables: {
            // fetch the first 7 days data
            filter: { created_at_gte: startDate, created_at_lte: endDate },
            sortField: "created_at",
        },
    });

    // handles all data selection
    const dateFilterHandler = (selectedDates) => {
        // selectedDates param  is [startDate, endDate]
        if (selectedDates[0] && selectedDates[1]) {
            setStartDate(selectedDates[0]);
            setEndDate(selectedDates[1]);
        }
    };

    useEffect(() => {
        if (data?.allAccounts) {
            setChartData(generateChartData(data.allAccounts));
            setAllAccounts(data.allAccounts);
            setNoAccounts(data.allAccounts.length);
            setNoCheques(_.filter(data.allAccounts, { type: "cheque" }).length);
            setNoSavings(_.filter(data.allAccounts, { type: "savings" }).length);
        }
    }, [data]);

    return (
        <>
            {loading ? (
                <div>Fetching Data ...</div>
            ) : (
                <>
                    {/* Dashboard actions */}
                    <div className=" mb-8">
                        {/* Datepicker built with ant design flatpickr */}
                        <Datepicker dateFilterHandler={dateFilterHandler} />
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* No of Accounts, Savings and Cheques */}
                        <DisplayDashCard
                            displayHeader={"Accounts"}
                            displayLowerHeader={`${moment(startDate).format("MMM Do YY")} to ${moment(endDate).format("MMM Do YY")}`}
                            displayTotal={`${noAccounts} Total Accounts`}
                            subDisplayText={`${noCheques} cheque  & ${noSavings} Savings Accounts`}
                        />
                        {console.log(chartData)}
                        {/* Bar chart (Direct vs Indirect) */}
                        <ColumnChart config={chartData} label="No.Accounts Fetched Vs Day/Month" />
                        {/* Table (Top Channels) */}
                        <AccountsTable data={allAccounts} />
                    </div>
                </>
            )}
        </>
    );
}

export default Accounts;
