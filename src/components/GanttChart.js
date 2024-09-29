// src/components/GanttChart.js
import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts/highcharts-gantt';
import HighchartsReact from 'highcharts-react-official';
import { Container, Row, Col, Form, Button, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';

const apiUrl = process.env.REACT_APP_API_URL;

const GanttChart = () => {
    const [chartData, setChartData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [diseaseNames, setDiseaseNames] = useState([]);

    const [inputDisease, setInputDisease] = useState('');
    const [inputYear, setInputYear] = useState('');
    const [filteredDisease, setFilteredDisease] = useState('');
    const [filteredYear, setFilteredYear] = useState('');
    const [allData, setAllData] = useState({});
    const [viewMode, setViewMode] = useState('yearly'); // Default to yearly
    const [minYear, setMinYear] = useState(2012); // Default or initial value
    const [maxYear, setMaxYear] = useState(2022); // Default or initial value

    const [weeklyYear, setWeeklyYear] = useState(maxYear); // default to latest year


    useEffect(() => {
        axios.get(`${apiUrl}/api/disease/get`)
            .then(response => {
                const diseaseData = response.data;
                setAllData(diseaseData);

                // Calculate minYear and maxYear from the returned data
                let years = [];
                Object.values(diseaseData).forEach(disease => {
                    years.push(...Object.keys(disease).map(year => parseInt(year, 10)));
                });

                const minYear = Math.min(...years);
                const maxYear = Math.max(...years);

                // Set the minYear and maxYear states
                setMinYear(minYear);
                setMaxYear(maxYear);

                // Format the data for the Gantt chart and update state
                const formattedData = formatDataForGantt(diseaseData, 'yearly');
                setChartData(formattedData.data);
                setCategories(formattedData.categories);
                setDiseaseNames(Object.keys(diseaseData));
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    // Function to construct gantt chart data
    const formatDataForGantt = (data, mode = 'yearly') => {
        const ganttData = [];
        const diseaseCategories = [];
        let yIndex = 0;

        for (const diseaseName in data) {
            diseaseCategories.push(diseaseName);
            const yearData = data[diseaseName];
            const currentYIndex = yIndex;

            for (const year in yearData) {
                const weekRanges = yearData[year];
                weekRanges.forEach(weekRange => {
                    const [range, cases] = weekRange.split(',');
                    const [startWeek, endWeek] = range.includes('-') ? range.split('-') : [range, range];

                    const startDate = moment().utc().year(year).week(startWeek.replace('W', '')).startOf('week').toDate();
                    const endDate = moment().utc().year(year).week(endWeek.replace('W', '')).endOf('week').toDate();

                    ganttData.push({
                        id: `${diseaseName}-${year}-${weekRange}`,
                        name: diseaseName,
                        start: Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()),
                        end: Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()),
                        y: currentYIndex,
                        customData: parseInt(cases, 10),
                    });
                });
            }
            yIndex++;
        }

        return {
            data: ganttData,
            categories: diseaseCategories,
        };
    };

    const handleApplyFilter = () => {
        if (inputDisease && inputYear) {
            setFilteredDisease(inputDisease);
            setFilteredYear(inputYear);
            setViewMode('weekly');

            const filteredData = {};
            if (allData[inputDisease]) {
                filteredData[inputDisease] = {
                    [inputYear]: allData[inputDisease][inputYear] || [],
                };
            }
            const formattedData = formatDataForGantt(filteredData, 'weekly');
            setChartData(formattedData.data);
            setCategories([inputDisease]);
        }
    };

    useEffect(() => {
        if (viewMode === 'weekly' && filteredDisease && filteredYear) {
            const filteredData = {};
            if (allData[filteredDisease]) {
                filteredData[filteredDisease] = {
                    [filteredYear]: allData[filteredDisease][filteredYear] || [],
                };
            }
            const formattedData = formatDataForGantt(filteredData, 'weekly');
            setChartData(formattedData.data);
            setCategories([filteredDisease]);
        }
    }, [filteredDisease, filteredYear, allData, viewMode]);


    const resetView = () => {
        setViewMode('yearly');
        const formattedData = formatDataForGantt(allData, 'yearly');
        setChartData(formattedData.data);
        setCategories(Object.keys(allData));
        setFilteredDisease('');
        setFilteredYear('');
        setInputDisease('');
        setInputYear('');
    };

    const toggleViewMode = (value) => {
        setViewMode(value);
        if (value === 'weekly') {
            setWeeklyYear(maxYear); // Default to the latest year
            const filteredData = {};
            for (const disease in allData) {
                filteredData[disease] = {
                    [maxYear]: allData[disease][maxYear] || [],
                };
            }
            const formattedData = formatDataForGantt(filteredData, 'weekly');
            setChartData(formattedData.data);
            setCategories(Object.keys(allData));
        } else {
            const formattedData = formatDataForGantt(allData, value);
            setChartData(formattedData.data);
            setCategories(Object.keys(allData));
        }
    };

    const getTotalWeeks = () => {
        return moment().utc().year(maxYear).weeksInYear() * (maxYear - minYear + 1);
    };

    const minWidth = viewMode === 'weekly' ? getTotalWeeks() * 50 : 2000;

    const options = {
        chart: {
            type: 'gantt',
            height: viewMode === 'weekly' ? 1080 : categories.length * 30 + 100,
            scrollablePlotArea: {
                minHeight: 600,
                minWidth: minWidth,
                scrollPositionY: 0,
                scrollPositionX: 0,
            },
            backgroundColor: 'rgba(255, 255, 255, 1)',
        },
        title: {
            text: `Infectious Disease Gantt Chart (${viewMode === 'yearly' ? 'Yearly View' : 'Weekly View'})`,
        },
        xAxis: {
            type: 'datetime',
            tickInterval: viewMode === 'weekly' ? 7 * 24 * 3600 * 1000 : 365 * 24 * 3600 * 1000,
            labels: {
                format: viewMode === 'weekly' ? '{value:%W}' : '{value:%Y}',
                align: 'center',
                step: 1,
            },
            min: Date.UTC(minYear, 0, 1),
            max: viewMode === 'weekly' ? Date.UTC(maxYear, 11, 31) : Date.UTC(maxYear, 11, 31),
            startOnTick: true,
            endOnTick: true,
            gridLineWidth: 1
        },
        yAxis: {
            type: 'category',
            categories: categories,
            min: 0,
            max: categories.length - 1,
            title: {
                text: 'Diseases',
            },
            reversed: true,
            gridLineWidth: 1,
            tickWidth: 0,
            labels: {
                style: {
                    fontSize: '12px'
                },
            }
        },
        series: [{
            name: 'Infectious Diseases',
            data: chartData,
            dataLabels: {
                enabled: false,
            },
            borderColor: 'gray',
            pointWidth: 15,
        }],
        tooltip: {
            formatter: function () {
                return `<b>${this.point.name}</b><br/>
            Start: ${Highcharts.dateFormat('%Y-%m-%d', this.point.start)}<br/>
            End: ${Highcharts.dateFormat('%Y-%m-%d', this.point.end)}<br/>
            Number of Cases: ${this.point.customData}`;
            },
        }
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Infectious Disease Gantt Chart</h3>
                </Col>
            </Row>

            {/* View Mode Selection */}
            <Row className="mb-4" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <ToggleButtonGroup type="radio" name="viewMode" value={viewMode} onChange={toggleViewMode}>
                    <ToggleButton variant="outline-primary" value="yearly">Yearly View</ToggleButton>
                    <ToggleButton variant="outline-primary" value="weekly">Weekly View</ToggleButton>
                </ToggleButtonGroup>
                {viewMode === 'weekly' && (
                    <Col md={2} style={{ marginLeft: '10px' }}>
                        <Form.Control
                            as="select"
                            value={weeklyYear}
                            onChange={(e) => {
                                const selectedYear = e.target.value;
                                setWeeklyYear(selectedYear);

                                // Update chart data for the selected year
                                const filteredData = {};
                                for (const disease in allData) {
                                    filteredData[disease] = {
                                        [selectedYear]: allData[disease][selectedYear] || [],
                                    };
                                }
                                const formattedData = formatDataForGantt(filteredData, 'weekly');
                                setChartData(formattedData.data);
                                setCategories(Object.keys(allData));
                            }}
                        >
                            {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </Form.Control>
                    </Col>
                )}
            </Row>

            {/* Filter/Search Controls */}
            <Row className="mb-4" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Col md={3}>
                    <Form.Control
                        type="text"
                        list="diseaseOptions"
                        placeholder="Enter disease name"
                        value={inputDisease}
                        onChange={(e) => setInputDisease(e.target.value)}
                    />
                    <datalist id="diseaseOptions">
                        {diseaseNames.map((name, index) => (
                            <option key={index} value={name} />
                        ))}
                    </datalist>
                </Col>
                <Col md={2}>
                    <Form.Control
                        as="select"
                        value={inputYear}
                        onChange={(e) => setInputYear(e.target.value)}
                    >
                        <option value="">Select Year</option>
                        {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Form.Control>
                </Col>
                <Col md={2} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="primary" onClick={handleApplyFilter}>Apply</Button>
                    <Button variant="secondary" className="ml-2" onClick={resetView}>Reset</Button>
                </Col>
            </Row>

            {/* Gantt Chart Display */}
            <Row>
                <Col className="p-0">
                    <div style={{
                        maxHeight: '600px',
                        overflowY: 'auto', // Allow vertical scroll if content exceeds height
                        overflowX: 'hidden', // Hide horizontal scrollbar from the container
                        whiteSpace: 'nowrap',
                        paddingBottom: '20px',
                        backgroundColor: '#fff'
                    }}>
                        <div style={{ minWidth: '100%' }}>
                            <HighchartsReact
                                highcharts={Highcharts}
                                constructorType={'ganttChart'}
                                options={options}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );

};

export default GanttChart;
