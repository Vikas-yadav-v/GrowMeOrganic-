import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import DropdownImage from "../assets/down-arrow.png";
import Popbox from "./Popbox";

interface IResponseDataModel {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: string;
    date_end: string;
}

interface IApiResponse {
    data: IResponseDataModel[];
    pagination: {
        total: number;
    };
}

const API_URL = "https://api.artic.edu/api/v1/artworks?page";

const apiCall = async (page: number, limit: number) => {
   const res = await fetch(`${API_URL}=${page}&limit=${limit}`);
   return await res.json()
}

export default function ArtworksTable() {
    const [artworks, setArtworks] = useState<IResponseDataModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const [pageSelections, setPageSelections] = useState<{
        [page: number]: IResponseDataModel[];
    }>({});

    const [selectedRows, setSelectedRows] = useState<IResponseDataModel[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [showSelectDialog, setShowSelectDialog] = useState<boolean>(false);
    const [tempSelectCount, setTempSelectCount] = useState<string>("");

    const popboxRef = useRef<HTMLDivElement | null>(null);

    const fetchArtworks = async (
        page: number,
        limit: number
    ): Promise<IResponseDataModel[]> => {
        setLoading(true);
        try {
            const data: IApiResponse= await apiCall(page, limit)
            setArtworks(data.data);
            setTotalRecords(data.pagination.total);
            return data.data;
        } catch (error) {
            console.error("API Error:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtworks(1, rows);
    }, [rows]);

    useEffect(() => {
        setSelectedRows(pageSelections[currentPage] || []);
    }, [currentPage, pageSelections]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showSelectDialog &&
                popboxRef.current &&
                !popboxRef.current.contains(event.target as Node)
            ) {
                setShowSelectDialog(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showSelectDialog]);

    const onPageChange = async (e: {
        first: number;
        page: number;
        rows: number;
    }) => {
        const page = e.page + 1;
        setFirst(e.first);
        setRows(e.rows);
        setCurrentPage(page);
        await fetchArtworks(page, e.rows);
    };

    const onSelectionChange = (e: { value: IResponseDataModel[] }) => {
        setSelectedRows(e.value);
        setPageSelections(prev => ({
            ...prev,
            [currentPage]: e.value
        }));
    };

    const applyCustomSelection = async (): Promise<void> => {
        const num = Number(tempSelectCount);
        if (!num || num <= 0) {
            setPageSelections({});
            setSelectedRows([]);
            setShowSelectDialog(false);
            setTempSelectCount("");
            return;
        }
        setLoading(true);
        try {
            const data: IApiResponse = await apiCall(1, num)
            const selectedData = data.data;

            const newPageSelections: {
                [page: number]: IResponseDataModel[];
            } = {};

            selectedData.forEach((item, index) => {
                const pageNumber = Math.floor(index / rows) + 1;
                if (!newPageSelections[pageNumber]) {
                    newPageSelections[pageNumber] = [];
                }
                newPageSelections[pageNumber].push(item);
            });

            setPageSelections(newPageSelections);
            setSelectedRows(newPageSelections[currentPage] || []);

        } catch (error) {
            console.error("Custom selection error:", error);
        } finally {
            setLoading(false);
            setShowSelectDialog(false);
            setTempSelectCount("");
        }
    };

    const onPopToggle = (
        e: React.MouseEvent<HTMLDivElement | HTMLImageElement>
    ) => {
        e.stopPropagation();
        setShowSelectDialog(prev => !prev);
    };

    const renderCell = (value?: string | null) => {
        if (!value) {
            return <span className="text-gray-400">N/A</span>;
        }
        return value;
    };

    const totalSelected = Object.values(pageSelections)
        .flat()
        .length;

     const paginatorTemplate = {
        layout: "CurrentPageReport PrevPageLink PageLinks NextPageLink",
        CurrentPageReport: (options: any) => {
            return (
                <span>
                    Showing{" "}
                    <b>{options.first}</b> to{" "}
                    <b>{options.last}</b> of{" "}
                    <b>{options.totalRecords}</b> entries
                </span>
            );
        },
        PrevPageLink: (options: any) => (
            <button
                type="button"
                onClick={options.onClick}
                disabled={options.disabled}
                className="custom-page-btn"
            >
                Previous
            </button>
        ),
        NextPageLink: (options: any) => (
            <button
                type="button"
                onClick={options.onClick}
                disabled={options.disabled}
                className="custom-page-btn"
            >
                Next
            </button>
        )
    };

    return (
        <div className="m-2 dashboard-main-section">
            <div className="w-full px-3 py-2 text-sm bg-gray-200">
                Selected: {totalSelected} rows
            </div>

            <div className="table-wraper">
                <DataTable
                    value={artworks}
                    loading={loading}
                    dataKey="id"
                    selection={selectedRows}
                    onSelectionChange={onSelectionChange}
                    selectionMode="checkbox"
                    lazy
                    scrollable
                    stripedRows
                >
                    <Column
                        selectionMode="multiple"
                        headerStyle={{ width: "3.5rem" }}
                        header={
                            <div
                                className="select-column-header select-popover-wrapper"
                                onClick={onPopToggle}
                            >
                                <img
                                    src={DropdownImage}
                                    alt="dropdown"
                                    className="select-column-icon"
                                />
                            </div>
                        }
                    />

                    <Column field="title" header="Title" body={(row) => renderCell(row.title)} />
                    <Column field="place_of_origin" header="Place of Origin" body={(row) => renderCell(row.place_of_origin)} />
                    <Column field="artist_display" header="Artist Display" body={(row) => renderCell(row.artist_display)} />
                    <Column field="inscriptions" header="Inscriptions" body={(row) => renderCell(row.inscriptions)} />
                    <Column field="date_start" header="Date Start" body={(row) => renderCell(row.date_start)} />
                    <Column field="date_end" header="Date End" body={(row) => renderCell(row.date_end)} />
                </DataTable>

                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPageChange={onPageChange}
                    pageLinkSize={5}
                    className="custom-paginator"
                    template={paginatorTemplate}
                />
            </div>

            {showSelectDialog && (
                <div ref={popboxRef}>
                    <Popbox
                        tempSelectCount={tempSelectCount}
                        setTempSelectCount={setTempSelectCount}
                        applyCustomSelection={applyCustomSelection}
                    />
                </div>
            )}
        </div>
    );
}