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

export default function ArtworksTable() {
    const [artworks, setArtworks] = useState<IResponseDataModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectedRows, setSelectedRows] = useState<IResponseDataModel[]>([]);

    const [showSelectDialog, setShowSelectDialog] = useState<boolean>(false);
    const [tempSelectCount, setTempSelectCount] = useState<string>("");

    const popboxRef = useRef<HTMLDivElement | null>(null);

    const fetchArtworks = async (page: number, limit: number): Promise<void> => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}=${page}&limit=${limit}`);
            const data: IApiResponse = await res.json();
            setArtworks(data.data);
            setTotalRecords(data.pagination.total);
        } catch (error) {
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtworks(1, rows);
    }, [rows]);

    useEffect(() => {
        const restoredSelection = artworks.filter(row =>
            selectedIds.has(row.id)
        );
        setSelectedRows(restoredSelection);
    }, [artworks, selectedIds]);

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

    const onPageChange = (e: {
        first: number;
        page: number;
        rows: number;
    }): void => {
        const page = e.page + 1;
        setFirst(e.first);
        setRows(e.rows);
        fetchArtworks(page, e.rows);
    };

    const onSelectionChange = (e: { value: IResponseDataModel[] }) => {
        setSelectedRows(e.value);

        setSelectedIds(prev => {
            const next = new Set(prev);
            artworks.forEach(row => next.delete(row.id));
            e.value.forEach(row => next.add(row.id));
            return next;
        });
    };

    const applyCustomSelection = (): void => {
        const num = Number(tempSelectCount);
        if (!num || num <= 0) {
            setSelectedRows([]);
            setSelectedIds(prev => {
                const next = new Set(prev);
                artworks.forEach(row => next.delete(row.id));
                return next;
            });

            setShowSelectDialog(false);
            setTempSelectCount("");
            return;
        }

        const count = Math.min(num, artworks.length);
        const rowsToSelect = artworks.slice(0, count);
        setSelectedRows(rowsToSelect);

        setSelectedIds(prev => {
            const next = new Set(prev);
            artworks.forEach(row => next.delete(row.id));
            rowsToSelect.forEach(row => next.add(row.id));
            return next;
        });

        setShowSelectDialog(false);
        setTempSelectCount("");
    };

    const onPopToggle = (
        e: React.MouseEvent<HTMLDivElement | HTMLImageElement>
    ): void => {
        e.stopPropagation();
        setShowSelectDialog(prev => !prev);
    };

    const renderCell = (value?: string | null) => {
        if (value === null || value === undefined || value === "") {
            return <span className="text-gray-400">N/A</span>;
        }
        return value;
    };

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
                Selected: {selectedIds.size} rows
            </div>
            <div className="table-wraper">
                <DataTable
                    value={artworks}
                    loading={loading}
                    dataKey="id"
                    selection={selectedRows}
                    onSelectionChange={onSelectionChange}
                    lazy
                    scrollable
                    stripedRows
                    resizableColumns={false}
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
                    template={paginatorTemplate}
                    className="custom-paginator"
                // currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} entries`}
                // currentPageReportTemplate={`Showing <span>${first}</span> to {last} of {totalRecords} entries`}
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
