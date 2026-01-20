import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import DropdownImage from "../assets/down-arrow.png";
import Popbox from "./Popbox";
/* ================= TYPES ================= */

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

/* ================= COMPONENT ================= */

export default function ArtworksTable() {
    const [artworks, setArtworks] = useState<IResponseDataModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Pagination
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    // Selection
    const [selectedRows, setSelectedRows] = useState<IResponseDataModel[]>([]);

    // Custom selection popup
    const [showSelectDialog, setShowSelectDialog] = useState<boolean>(false);
    const [tempSelectCount, setTempSelectCount] = useState<string>("");

    /* ================= API ================= */

    const fetchArtworks = async (page: number, limit: number): Promise<void> => {
        setLoading(true);
        try {
            const res = await fetch(
                `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`
            );
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

    /* ================= HANDLERS ================= */

    const onPageChange = (e: { first: number, page: number, rows: number}): void => {
        const page = e.page + 1;
        setFirst(e.first);
        setRows(e.rows);
        setSelectedRows([]);
        fetchArtworks(page, e.rows);
    };


    const onSelectionChange = (e: {
        value: IResponseDataModel[];
    }) => {
        setSelectedRows(e.value);
    };


    const applyCustomSelection = (): void => {
        const num = Number(tempSelectCount);

        if (!num || num <= 0) {
            setSelectedRows([]);
        } else {
            setSelectedRows(artworks.slice(0, Math.min(num, artworks.length)));
        }

        setShowSelectDialog(false);
        setTempSelectCount("");
    };

    const onPopToggle = (
        e: React.MouseEvent<HTMLDivElement | HTMLImageElement>
    ): void => {
        e.stopPropagation();
        setShowSelectDialog((prev) => !prev);
    };

    /* ================= RENDER ================= */

    return (
        <div className="m-2 bg-black">
            <h3 className="mb-3 text-base font-medium">Artworks</h3>

            <div className="w-full px-3 py-2 text-sm bg-gray-200">
                Selected: {selectedRows.length} rows
            </div>

            <div style={{ paddingTop: 30 }}>
                <DataTable
                    value={artworks}
                    loading={loading}
                    dataKey="id"
                    selection={selectedRows}
                    onSelectionChange={onSelectionChange}
                    lazy
                    scrollable
                    scrollHeight="420px"
                    resizableColumns
                    columnResizeMode="expand"
                    showGridlines
                >
                    {/* MULTI SELECT HEADER */}
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

                    <Column field="title" header="Title" />
                    <Column field="place_of_origin" header="Place of Origin" />
                    <Column field="artist_display" header="Artist Display" />
                    <Column field="inscriptions" header="Inscriptions" />
                    <Column field="date_start" header="Date Start" />
                    <Column field="date_end" header="Date End" />
                </DataTable>

                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPageChange={onPageChange}
                />

                {showSelectDialog && (
                    <Popbox
                        tempSelectCount={tempSelectCount}
                        setTempSelectCount={setTempSelectCount}
                        applyCustomSelection={applyCustomSelection}
                        onPopToggle={() => setShowSelectDialog(false)}
                    />
                )}
            </div>
        </div>
    );
}
