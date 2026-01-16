import { useState, useCallback, useMemo } from 'react';
import { Chart as ChartJS, PointElement, Tooltip, Legend, registerables } from 'chart.js';
import 'chartjs-plugin-dragdata';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bubble } from 'react-chartjs-2';
import { useField } from '../useField';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';

// Field config interface
interface EisenhouwerFieldConfig {
  key: string;
  type: string;
  title?: string;
  tip?: string;
  dataSetsPath?: string;
  dataSetsKeyToLabel?: boolean;
  dataSetsDataPointsPath?: string;
  dataSetsDataPointsKeyToItem?: boolean;
  dataSetsDataPointPosXPath?: string;
  dataSetsDataPointPosYPath?: string;
  dataSetsDataPointLabelTemplate?: string;
  xScaleTitle?: string;
  yScaleTitle?: string;
  pointRadius?: number;
  labelDoNow?: string;
  labelToPlan?: string;
  labelDelegate?: string;
  labelDelete?: string;
}

// Quadrants plugin options interface
interface QuadrantOptions {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
}

// Chart data point interface
interface ChartPoint {
  x: number;
  y: number;
  _label?: string;
  [key: string]: unknown;
}

// Chart dataset interface
interface ChartDataset {
  label: string;
  data: ChartPoint[];
}

// Chart data interface
interface ChartData {
  datasets: ChartDataset[];
}

interface Props {
  compositeKey: string;
}

// ============================================================================
// Type-safe path accessor utilities (replacing eval)
// ============================================================================

/**
 * Get nested value using path string (e.g., ".position.x")
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path
    .replace(/^\./, '')
    .split(/[.[\]]/)
    .filter(Boolean);
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Set nested value using path string
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path
    .replace(/^\./, '')
    .split(/[.[\]]/)
    .filter(Boolean);
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) current[parts[i]] = {};
    current = current[parts[i]] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Replace template eval with safe interpolation
 * Supports ${point.propertyName} syntax in templates
 */
function formatPointLabel(template: string, point: Record<string, unknown>): string {
  return template.replace(/\$\{point\.(\w+)\}/g, (_, key) => String(point[key] ?? ''));
}

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Convert array to object using a key field
 */
function arrayToObject<T extends Record<string, unknown>>(
  arrayIn: T[],
  keyField: string
): Record<string, T> {
  return arrayIn.reduce(
    (obj, item) => {
      obj[item[keyField] as string] = item;
      return obj;
    },
    {} as Record<string, T>
  );
}

// ============================================================================
// Chart.js quadrants plugin
// ============================================================================

const quadrants = {
  id: 'quadrants',

  beforeDraw(
    chart: { ctx: CanvasRenderingContext2D; chartArea: { left: number; top: number; right: number; bottom: number }; scales: { x: { getPixelForValue: (v: number) => number }; y: { getPixelForValue: (v: number) => number } } },
    _args: unknown,
    options: QuadrantOptions
  ) {
    const {
      ctx,
      chartArea: { left, top, right, bottom },
      scales: { x, y },
    } = chart;

    const midX = x.getPixelForValue(50);
    const midY = y.getPixelForValue(50);

    ctx.save();
    ctx.fillStyle = options.topLeft;
    ctx.fillRect(left, top, midX - left, midY - top);

    ctx.fillStyle = options.topRight;
    ctx.fillRect(midX, top, right - midX, midY - top);
    ctx.fillStyle = options.bottomRight;
    ctx.fillRect(midX, midY, right - midX, bottom - midY);
    ctx.fillStyle = options.bottomLeft;
    ctx.fillRect(left, midY, midX - left, bottom - midY);
    ctx.restore();
  },
};

// Register Chart.js plugins
ChartJS.register(ChartDataLabels, PointElement, Tooltip, quadrants, annotationPlugin, Legend, ...registerables);

const emptyDataSet: ChartData = {
  datasets: [
    {
      label: '',
      data: [],
    },
  ],
};

// ============================================================================
// Data transformation functions
// ============================================================================

/**
 * Parse points from form data format to chart format
 */
function inParsePoints(newPData: unknown, config: EisenhouwerFieldConfig): ChartPoint[] {
  let points: ChartPoint[] = [];

  if (config.dataSetsDataPointsKeyToItem) {
    // Convert object with keys to array with _label
    const dataObj = newPData as Record<string, Record<string, unknown>>;
    points = Object.keys(dataObj).map((key) => {
      const rval = { ...dataObj[key], _label: key } as ChartPoint;
      return rval;
    });
  } else {
    points = (newPData as ChartPoint[]) || [];
  }

  // Extract x/y from nested paths
  points.forEach((point) => {
    point.x = (getNestedValue(point, config.dataSetsDataPointPosXPath || '') as number) || 0;
    point.y = (getNestedValue(point, config.dataSetsDataPointPosYPath || '') as number) || 0;
  });

  return points;
}

/**
 * Parse datasets from form data format to chart format
 */
function inParseDataSets(data: unknown, config: EisenhouwerFieldConfig): ChartData {
  const newData = getNestedValue(data, config.dataSetsPath || '') as Record<string, unknown>;

  let rdatasets: ChartDataset[] = [];

  if (config.dataSetsKeyToLabel) {
    // Convert object with keys as labels
    const dataObj = newData as Record<string, unknown>;
    rdatasets = Object.keys(dataObj).map((key) => {
      const newPData = getNestedValue(dataObj[key], config.dataSetsDataPointsPath || '');
      return { label: key, data: inParsePoints(newPData, config) };
    });
  } else {
    // Array format
    const dataArr = newData as unknown as Record<string, unknown>[];
    rdatasets = dataArr.map((item) => {
      const newPData = getNestedValue(item, config.dataSetsDataPointsPath || '');
      return {
        ...item,
        label: (item.label as string) || '',
        data: inParsePoints(newPData, config),
      } as ChartDataset;
    });
  }

  return { datasets: rdatasets };
}

/**
 * Parse points from chart format back to form data format
 */
function outParsePoints(points: ChartPoint[], config: EisenhouwerFieldConfig): ChartPoint[] {
  points.forEach((point) => {
    if (config.dataSetsDataPointPosXPath) {
      setNestedValue(point as Record<string, unknown>, config.dataSetsDataPointPosXPath, point.x);
    }
    if (config.dataSetsDataPointPosYPath) {
      setNestedValue(point as Record<string, unknown>, config.dataSetsDataPointPosYPath, point.y);
    }
  });
  return points;
}

/**
 * Parse datasets from chart format back to form data format
 */
function outParseDataSets(cdata: ChartData, config: EisenhouwerFieldConfig): unknown {
  const cdataIn = { ...cdata, datasets: [...cdata.datasets] };
  let cdataOut: Record<string, unknown> = {};

  if (config.dataSetsKeyToLabel) {
    const dsets: Record<string, unknown> = {};

    const datasetsObj = arrayToObject(cdataIn.datasets as (ChartDataset & Record<string, unknown>)[], 'label');

    if (config.dataSetsDataPointsKeyToItem) {
      Object.keys(datasetsObj).forEach((key) => {
        const tmpData = outParsePoints([...datasetsObj[key].data], config);
        const tmpDataObj = arrayToObject(tmpData as (ChartPoint & Record<string, unknown>)[], '_label');

        dsets[key] = {};

        if (config.dataSetsDataPointsPath) {
          (dsets[key] as Record<string, unknown>)[config.dataSetsDataPointsPath.substring(1)] = tmpDataObj;
        } else {
          dsets[key] = tmpDataObj;
        }
      });
    }

    if (config.dataSetsPath) {
      cdataOut[config.dataSetsPath.substring(1)] = dsets;
    } else {
      cdataOut = dsets;
    }
  } else {
    const dsets: unknown[] = [];

    cdataIn.datasets.forEach((ds) => {
      let newDs: Record<string, unknown> = {};
      if (config.dataSetsDataPointsPath) {
        newDs[config.dataSetsDataPointsPath.substring(1)] = ds.data;
      } else {
        newDs = { data: ds.data };
      }
      dsets.push(newDs);
    });

    if (config.dataSetsPath) {
      cdataOut[config.dataSetsPath.substring(1)] = dsets;
    } else {
      return dsets;
    }
  }

  return cdataOut;
}

// ============================================================================
// Component
// ============================================================================

function EisenhouwerField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<Record<string, unknown>>(compositeKey);
  const config = field as EisenhouwerFieldConfig;

  // Initialize chart data from form value (lazy initialization)
  const [cdata, _setCdata] = useState<ChartData>(() => {
    if (value) {
      return inParseDataSets(value, config);
    }
    return emptyDataSet;
  });

  // Handle drag end - save changes to form
  const handleDragEnd = useCallback(() => {
    setValue(outParseDataSets(cdata, config) as Record<string, unknown>, 250);
  }, [cdata, config, setValue]);

  // Build icon buttons
  const iconButtons = useMemo(() => {
    const buttons: React.ReactNode[] = [];
    if (config.tip) buttons.push(<Tip key="tip" markdown={config.tip} />);
    return buttons;
  }, [config.tip]);

  // Chart options
  const chartOptions = useMemo(
    () => ({
      scales: {
        x: {
          type: 'linear' as const,
          min: 0,
          max: 100,
          title: {
            display: true,
            text: config.xScaleTitle,
            font: {
              size: 26,
              weight: 'bold' as const,
            },
          },
        },
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: config.yScaleTitle,
            font: {
              size: 26,
              weight: 'bold' as const,
            },
          },
        },
      },
      elements: {
        point: {
          radius: config.pointRadius || 5,
        },
        line: {
          fill: false,
          tension: 0.4,
        },
      },
      layout: {
        padding: {
          top: 32,
          right: 16,
          bottom: 16,
          left: 8,
        },
      },
      plugins: {
        tooltip: {
          enabled: false,
        },
        colors: {
          enabled: true,
        },
        annotation: {
          annotations: {
            label1: {
              type: 'label' as const,
              xValue: 10,
              yValue: 95,
              content: [config.labelDoNow || 'DO NOW'],
              color: '#bcc0c0',
              font: {
                size: 26,
                weight: 'bold' as const,
              },
            },
            label2: {
              type: 'label' as const,
              xValue: 89,
              yValue: 95,
              content: [config.labelToPlan || 'TO PLAN'],
              color: '#bcc0c0',
              font: {
                size: 26,
                weight: 'bold' as const,
              },
            },
            label3: {
              type: 'label' as const,
              xValue: 11,
              yValue: 3,
              content: [config.labelDelegate || 'DELEGATE'],
              color: '#bcc0c0',
              font: {
                size: 26,
                weight: 'bold' as const,
              },
            },
            label4: {
              type: 'label' as const,
              xValue: 90,
              yValue: 3,
              content: [config.labelDelete || 'DELETE'],
              color: '#bcc0c0',
              font: {
                size: 26,
                weight: 'bold' as const,
              },
            },
          },
        },
        quadrants: {
          topLeft: '#ffe3e8',
          topRight: '#fff6e0',
          bottomRight: '#def3f3',
          bottomLeft: '#daeefb',
        },
        datalabels: {
          borderRadius: 4,
          offset: 6,
          anchor: 'center' as const,
          align: 'right' as const,
          formatter: (point: ChartPoint) => {
            if (config.dataSetsDataPointLabelTemplate) {
              return formatPointLabel(config.dataSetsDataPointLabelTemplate, point);
            }
            return `x=${point.x}, y=${point.y}`;
          },
        },
        dragData: {
          dragX: true,
          dragY: true,
          onDragEnd: () => {
            handleDragEnd();
          },
        },
      },
    }),
    [config, handleDragEnd]
  );

  return (
    <FormItemWrapper
      control={<Bubble data={cdata} options={chartOptions} />}
      iconButtons={iconButtons}
    />
  );
}

export default EisenhouwerField;
