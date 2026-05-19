package services

import (
	"sort"

	"github.com/lubasinkal/v-star/pkg/risk"
	"v-desktop/pkg/models"
)

type RiskService struct{}

func NewRiskService() *RiskService {
	return &RiskService{}
}

func (s *RiskService) ComputeRiskMetrics(losses []float64) models.RiskResponse {
	if len(losses) == 0 {
		return models.RiskResponse{}
	}
	r := risk.ComputeReport(losses)
	return models.RiskResponse{
		Mean:           r.Mean,
		StdDev:         r.StdDev,
		Min:            r.Min,
		Max:            r.Max,
		VaR95:          r.VaR95,
		VaR99:          r.VaR99,
		CTE95:          r.CTE95,
		CTE99:          r.CTE99,
		StdError:       r.StdError,
		Confidence95Lo: r.Confidence95Lo,
		Confidence95Hi: r.Confidence95Hi,
	}
}

func (s *RiskService) VaR(losses []float64, confidence float64) float64 {
	return risk.VaR(losses, confidence)
}

func (s *RiskService) CTE(losses []float64, confidence float64) float64 {
	return risk.CTE(losses, confidence)
}

func (s *RiskService) SortLosses(losses []float64) []float64 {
	sorted := make([]float64, len(losses))
	copy(sorted, losses)
	sort.Float64s(sorted)
	return sorted
}
