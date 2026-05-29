package services

import (
	"strings"
	"time"

	"github.com/lubasinkal/v-star/pkg/concurrency"
	"github.com/lubasinkal/v-star/pkg/rates"
	"github.com/lubasinkal/v-star/pkg/reader"
	"v-desktop/pkg/models"
)

type CensusService struct{}

func NewCensusService() *CensusService {
	return &CensusService{}
}

func (s *CensusService) ProcessCensusFromData(req models.CensusRequest, csvContent string) (*models.CensusResponse, error) {
	start := time.Now()
	conv := rates.NewRateConverter(req.InterestRate)

	opts := reader.CSVOptions{
		Header: true,
		Limit:  req.Limit,
	}
	if req.Limit <= 0 {
		opts.Limit = 0
	}

	var records []models.CensusRecordResult
	totalPV := 0.0

	err := reader.StreamCensusFromReader(strings.NewReader(csvContent), opts, func(rec reader.CensusRecord) {
		pv := conv.PresentValue(rec.SumAssured, rec.Term)
		totalPV += pv
		records = append(records, models.CensusRecordResult{
			Sex:          rec.Sex,
			PolicyType:   rec.PolicyType,
			Age:          rec.Age,
			SumAssured:   rec.SumAssured,
			Term:         rec.Term,
			PresentValue: pv,
		})
	})
	if err != nil {
		return nil, err
	}

	elapsed := time.Since(start).Milliseconds()
	return &models.CensusResponse{
		Records:      records,
		TotalPV:      totalPV,
		RecordCount:  len(records),
		ProcessingMs: elapsed,
	}, nil
}

func (s *CensusService) ProcessCensus(req models.CensusRequest) (*models.CensusResponse, error) {
	start := time.Now()
	conv := rates.NewRateConverter(req.InterestRate)

	opts := reader.CSVOptions{
		Header:  true,
		Limit:   req.Limit,
	}

	if req.Limit <= 0 {
		opts.Limit = 0
	}

	var records []models.CensusRecordResult
	totalPV := 0.0

	err := reader.StreamCensus(req.FilePath, opts, func(rec reader.CensusRecord) {
		pv := conv.PresentValue(rec.SumAssured, rec.Term)
		totalPV += pv
		records = append(records, models.CensusRecordResult{
			Sex:          rec.Sex,
			PolicyType:   rec.PolicyType,
			Age:          rec.Age,
			SumAssured:   rec.SumAssured,
			Term:         rec.Term,
			PresentValue: pv,
		})
	})
	if err != nil {
		return nil, err
	}

	elapsed := time.Since(start).Milliseconds()
	return &models.CensusResponse{
		Records:      records,
		TotalPV:      totalPV,
		RecordCount:  len(records),
		ProcessingMs: elapsed,
	}, nil
}

func (s *CensusService) ProcessCensusParallel(req models.CensusRequest) (*models.CensusResponse, error) {
	start := time.Now()
	conv := rates.NewRateConverter(req.InterestRate)

	opts := reader.CSVOptions{
		Header: true,
		Limit:  req.Limit,
	}

	if req.Limit <= 0 {
		opts.Limit = 0
	}

	workers := req.Workers
	if workers <= 0 {
		workers = 8
	}

	var allRecords []reader.CensusRecord
	err := reader.StreamCensus(req.FilePath, opts, func(rec reader.CensusRecord) {
		allRecords = append(allRecords, rec)
	})
	if err != nil {
		return nil, err
	}

	wp := concurrency.NewWorkerPool(workers, func(r reader.CensusRecord) float64 {
		return conv.PresentValue(r.SumAssured, r.Term)
	})

	totalPV := wp.ProcessBatch(allRecords)

	records := make([]models.CensusRecordResult, len(allRecords))
	for i, rec := range allRecords {
		records[i] = models.CensusRecordResult{
			Sex:          rec.Sex,
			PolicyType:   rec.PolicyType,
			Age:          rec.Age,
			SumAssured:   rec.SumAssured,
			Term:         rec.Term,
			PresentValue: conv.PresentValue(rec.SumAssured, rec.Term),
		}
	}

	elapsed := time.Since(start).Milliseconds()
	return &models.CensusResponse{
		Records:      records,
		TotalPV:      totalPV,
		RecordCount:  len(records),
		ProcessingMs: elapsed,
	}, nil
}

func (s *CensusService) GetCSVHeaders(filePath string) ([]string, error) {
	return reader.GetHeaders(filePath, ',')
}
