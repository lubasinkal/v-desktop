package services

import (
	"math"

	"github.com/lubasinkal/v-star/pkg/stochastic"
	"v-desktop/pkg/models"
)

type StochasticService struct{}

func NewStochasticService() *StochasticService {
	return &StochasticService{}
}

func (s *StochasticService) RunGBM(req models.MonteCarloRequest) models.MonteCarloResponse {
	var rg *stochastic.RateGenerator
	if req.Seed != 0 {
		rg = stochastic.NewRateGeneratorWithSeed(req.InitialRate, req.Drift, req.Volatility, uint64(req.Seed))
	} else {
		rg = stochastic.NewRateGenerator(req.InitialRate, req.Drift, req.Volatility)
	}

	paths := rg.GeneratePaths(req.NumPaths, req.Steps, req.Dt)

	return s.processPaths(paths, req.Steps)
}

func (s *StochasticService) RunVasicek(req models.MonteCarloRequest) models.MonteCarloResponse {
	var vg *stochastic.VasicekGenerator
	if req.Seed != 0 {
		vg = stochastic.NewVasicekGeneratorWithSeed(req.InitialRate, req.LongTermMean, req.MeanReversion, req.Volatility, uint64(req.Seed))
	} else {
		vg = stochastic.NewVasicekGenerator(req.InitialRate, req.LongTermMean, req.MeanReversion, req.Volatility)
	}

	paths := vg.GeneratePaths(req.NumPaths, req.Steps, req.Dt)

	return s.processPaths(paths, req.Steps)
}

func (s *StochasticService) processPaths(paths []stochastic.RatePath, steps int) models.MonteCarloResponse {
	// collect final values for risk analysis
	finalValues := make([]float64, len(paths))
	for i, p := range paths {
		finalValues[i] = p[len(p)-1]
	}

	// sample up to 50 paths for charting
	sampleCount := min(len(paths), 50)
	stepSize := len(paths) / sampleCount

	var pathPoints []models.PathPoint
	for step := 0; step <= steps; step++ {
		pp := models.PathPoint{Step: step, Values: make([]float64, 0, sampleCount)}
		for i := 0; i < len(paths); i += stepSize {
			if len(pp.Values) >= sampleCount {
				break
			}
			if step < len(paths[i]) {
				pp.Values = append(pp.Values, paths[i][step])
			}
		}
		pathPoints = append(pathPoints, pp)
	}

	return models.MonteCarloResponse{
		Paths:            pathPoints,
		FinalValues:      finalValues,
		SamplePathsCount: sampleCount,
	}
}

type VasicekParams struct {
	LongTermMean  float64
	MeanReversion float64
	Volatility    float64
	HalfLife      float64
}

func (s *StochasticService) GetVasicekParams(meanReversion float64) VasicekParams {
	halfLife := math.Log(2) / meanReversion
	return VasicekParams{
		LongTermMean:  0.05,
		MeanReversion: meanReversion,
		Volatility:    0.02,
		HalfLife:      halfLife,
	}
}
