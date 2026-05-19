package services

import (
	"fmt"

	"github.com/lubasinkal/v-star/pkg/rates"
	"github.com/lubasinkal/v-star/pkg/reserves"
	"v-desktop/pkg/models"
)

type ReserveService struct {
	mortSvc *MortalityService
}

func NewReserveService(mortSvc *MortalityService) *ReserveService {
	return &ReserveService{mortSvc: mortSvc}
}

func (s *ReserveService) CalcReserve(req models.ReserveRequest) (models.ReserveResponse, error) {
	table, err := s.mortSvc.GetTable(req.TableName)
	if err != nil {
		return models.ReserveResponse{}, err
	}

	conv := rates.NewRateConverter(req.Rate)
	policy := reserves.PolicySpec{
		Age:        req.Age,
		Term:       req.Term,
		SumAssured: req.SumAssured,
		Premium:    req.Premium,
	}

	var value float64
	switch req.Type {
	case "net-premium":
		value = reserves.NetPremiumReserve(policy, conv, table)
	case "gross-premium":
		value = reserves.GrossPremiumReserve(policy, req.Expenses, conv, table)
	case "prospective":
		value = reserves.ProspectiveReserve(policy, conv, table)
	case "retrospective":
		value = reserves.RetrospectiveReserve(policy, conv, table)
	default:
		return models.ReserveResponse{}, fmt.Errorf("unknown reserve type: %s", req.Type)
	}

	return models.ReserveResponse{Value: value, Type: req.Type}, nil
}
